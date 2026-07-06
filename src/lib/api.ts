const RAILWAY_URL='https://erpbackend-production-0d19.up.railway.app';
const BASE_URL=(import.meta.env.VITE_API_URL||(import.meta.env.DEV?'':RAILWAY_URL)).replace(/\/(?:api)?\/?$/,'');
export type ApiError={message:string};

async function request<T>(path:string,options:RequestInit={}):Promise<T>{
  const token=localStorage.getItem('northstar-token');
  const response=await fetch(`${BASE_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(token&&!path.startsWith('/auth/')?{Authorization:`Bearer ${token}`} : {}),...options.headers}});
  if(response.status===401&&!path.startsWith('/auth/')){localStorage.removeItem('northstar-token');sessionStorage.removeItem('northstar-demo-user');window.location.href='/login'}
  if(!response.ok){
    const error=await response.json().catch(()=>({detail:'Request failed'}));
    const fieldError=Object.values(error).find(value=>Array.isArray(value)) as string[]|undefined;
    throw new Error(error.detail||error.message||fieldError?.[0]||'Request failed');
  }
  return response.status===204?undefined as T:response.json();
}

export function api<T>(path:string,options:RequestInit={}):Promise<T>{
  return request<T>(`/api${path}`,options);
}

export function authApi<T>(path:string,options:RequestInit={}):Promise<T>{
  return request<T>(`/auth${path}`,options);
}
