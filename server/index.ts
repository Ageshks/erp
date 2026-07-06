import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

const prisma = new PrismaClient();
const app = express();
const secret = process.env.JWT_SECRET || 'northstar-local-development-secret';
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

type AuthedRequest = Request & { user?: { id:number; email:string; role:string } };
const asyncRoute = (handler: (req:AuthedRequest,res:Response)=>Promise<unknown>) => (req:AuthedRequest,res:Response,next:NextFunction) => Promise.resolve(handler(req,res)).catch(next);
function auth(req:AuthedRequest,res:Response,next:NextFunction) {
  const token=req.headers.authorization?.replace('Bearer ','');
  if(!token) return res.status(401).json({message:'Authentication required'});
  try { req.user=jwt.verify(token,secret) as AuthedRequest['user']; next(); }
  catch { return res.status(401).json({message:'Your session has expired'}); }
}

app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
  const {email,password}=req.body;
  const user=await prisma.user.findUnique({where:{email:String(email).toLowerCase()}});
  if(!user || !await bcrypt.compare(String(password),user.passwordHash)) return res.status(401).json({message:'Incorrect email or password'});
  const token=jwt.sign({id:user.id,email:user.email,role:user.role},secret,{expiresIn:'8h'});
  return res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
}));
app.get('/api/auth/me',auth,asyncRoute(async(req,res)=>res.json(await prisma.user.findUnique({where:{id:req.user!.id},select:{id:true,name:true,email:true,role:true}}))));

app.get('/api/dashboard',auth,asyncRoute(async(_req,res)=>{
  const [orders,customers,products,revenue]=await Promise.all([
    prisma.order.count(),prisma.customer.count(),prisma.product.findMany(),prisma.order.aggregate({_sum:{amount:true}})
  ]);
  const lowStock=products.filter(p=>p.stock<=p.reorderAt).length;
  const recentOrders=await prisma.order.findMany({take:5,orderBy:{orderedAt:'desc'},include:{customer:true,product:true}});
  return res.json({metrics:{revenue:revenue._sum.amount||0,orders,customers,lowStock},recentOrders});
}));

app.get('/api/orders',auth,asyncRoute(async(req,res)=>res.json(await prisma.order.findMany({where:req.query.status?{status:String(req.query.status)}:{},orderBy:{orderedAt:'desc'},include:{customer:true,product:true}}))));
app.post('/api/orders',auth,asyncRoute(async(req,res)=>{
  const {customerId,productId,quantity=1,status='Pending'}=req.body;
  const product=await prisma.product.findUniqueOrThrow({where:{id:Number(productId)}});
  const count=await prisma.order.count();
  const order=await prisma.order.create({data:{orderNumber:`ORD-${String(1049+count).padStart(4,'0')}`,customerId:Number(customerId),productId:Number(productId),quantity:Number(quantity),amount:product.unitPrice*Number(quantity),status}});
  await prisma.product.update({where:{id:product.id},data:{stock:{decrement:Number(quantity)}}});
  return res.status(201).json(order);
}));
app.patch('/api/orders/:id',auth,asyncRoute(async(req,res)=>res.json(await prisma.order.update({where:{id:Number(req.params.id)},data:{status:req.body.status}}))));
app.delete('/api/orders/:id',auth,asyncRoute(async(req,res)=>{await prisma.order.delete({where:{id:Number(req.params.id)}});return res.status(204).end()}));

app.get('/api/customers',auth,asyncRoute(async(_req,res)=>res.json(await prisma.customer.findMany({include:{orders:true},orderBy:{createdAt:'desc'}}))));
app.post('/api/customers',auth,asyncRoute(async(req,res)=>res.status(201).json(await prisma.customer.create({data:req.body}))));
app.put('/api/customers/:id',auth,asyncRoute(async(req,res)=>res.json(await prisma.customer.update({where:{id:Number(req.params.id)},data:req.body}))));
app.delete('/api/customers/:id',auth,asyncRoute(async(req,res)=>{await prisma.customer.delete({where:{id:Number(req.params.id)}});return res.status(204).end()}));

app.get('/api/products',auth,asyncRoute(async(_req,res)=>res.json(await prisma.product.findMany({orderBy:{name:'asc'}}))));
app.post('/api/products',auth,asyncRoute(async(req,res)=>res.status(201).json(await prisma.product.create({data:{...req.body,stock:Number(req.body.stock),reorderAt:Number(req.body.reorderAt),unitPrice:Number(req.body.unitPrice)}}))));
app.put('/api/products/:id',auth,asyncRoute(async(req,res)=>res.json(await prisma.product.update({where:{id:Number(req.params.id)},data:req.body}))));
app.delete('/api/products/:id',auth,asyncRoute(async(req,res)=>{await prisma.product.delete({where:{id:Number(req.params.id)}});return res.status(204).end()}));

app.get('/api/analytics',auth,asyncRoute(async(_req,res)=>{
  const orders=await prisma.order.findMany({include:{product:true}});
  const revenue=orders.reduce((sum,o)=>sum+o.amount,0);
  const byProduct=Object.values(orders.reduce<Record<string,{name:string,revenue:number}>>((acc,o)=>{acc[o.product.name]??={name:o.product.name,revenue:0};acc[o.product.name].revenue+=o.amount;return acc},{})).sort((a,b)=>b.revenue-a.revenue);
  return res.json({revenue,orders:orders.length,estimatedExpenses:revenue*.42,netProfit:revenue*.58,topProducts:byProduct.slice(0,4)});
}));
app.get('/api/organization',auth,asyncRoute(async(_req,res)=>res.json(await prisma.organization.findFirst())));
app.put('/api/organization',auth,asyncRoute(async(req,res)=>res.json(await prisma.organization.upsert({where:{id:1},create:{id:1,...req.body},update:req.body}))));

app.use((error:Error,_req:Request,res:Response,_next:NextFunction)=>{console.error(error);res.status(500).json({message:'Something went wrong',detail:process.env.NODE_ENV==='development'?error.message:undefined})});
app.listen(Number(process.env.PORT)||4000,()=>console.log('Northstar API running at http://localhost:4000'));
