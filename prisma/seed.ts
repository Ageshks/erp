import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma=new PrismaClient();
async function main(){
  await prisma.order.deleteMany();await prisma.customer.deleteMany();await prisma.product.deleteMany();
  await prisma.user.upsert({where:{email:'admin@northstar.com'},update:{},create:{name:'Alex Rivera',email:'admin@northstar.com',passwordHash:await bcrypt.hash('admin123',10),role:'ADMIN'}});
  const customerData=[['Olivia Martin','olivia@acme.co','Acme Inc.'],['Jackson Lee','jackson@north.io','North Labs'],['Sophia Brown','sophia@studio.co','Studio & Co.'],['Noah Williams','noah@bright.in','Brightworks'],['Emma Davis','emma@field.com','Field House']];
  const customers=[];for(const [name,email,company] of customerData)customers.push(await prisma.customer.create({data:{name,email,company,status:name==='Noah Williams'?'Inactive':'Active'}}));
  const productData=[['Workspace Pro','OFF-1001','Office Furniture',126,34,1280],['Ergo Chair','OFF-1002','Office Furniture',42,48,430],['Studio Lamp','LGT-2041','Lighting',8,24,160],['Oak Desk','OFF-1014','Office Furniture',0,10,810],['Monitor Stand','ACC-3205','Accessories',84,20,245],['Desk Organizer','ACC-3210','Accessories',163,30,72]] as const;
  const products=[];for(const [name,sku,category,stock,reorderAt,unitPrice] of productData)products.push(await prisma.product.create({data:{name,sku,category,stock,reorderAt,unitPrice}}));
  const statuses=['Completed','Processing','Completed','Pending','Completed','Cancelled','Processing'];
  for(let i=0;i<7;i++){const product=products[i%products.length];await prisma.order.create({data:{orderNumber:`ORD-${1048-i}`,customerId:customers[i%customers.length].id,productId:product.id,quantity:1,amount:product.unitPrice,status:statuses[i],orderedAt:new Date(2026,6,4-Math.floor(i/2))}})}
  await prisma.organization.upsert({where:{id:1},update:{},create:{id:1,name:'Northstar Workspace',businessType:'Retail',email:'hello@northstar.co',phone:'+91 98765 43210',address:'14 Residency Road, Bengaluru, Karnataka 560025',currency:'USD',fiscalYear:'April – March'}});
}
main().finally(()=>prisma.$disconnect());
