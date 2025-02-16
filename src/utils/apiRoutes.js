// const baseUrl = import.meta.env.VITE_API_URL;

const baseUrl = "http://localhost:4000/api" 

export const apiRoutes = {
  baseUrl,
  purchase: `${baseUrl}/purchase`,
  checkup: `${baseUrl}/checkup`,
  supplier: `${baseUrl}/supplier`,
  medicine: `${baseUrl}/medicine`,
  stock: `${baseUrl}/stock`,
  patient: `${baseUrl}/patient`,
  category: `${baseUrl}/category`,
  admin: `${baseUrl}/admin`,
  otp: `${baseUrl}/otp`,
  mail: `${baseUrl}/mail`,
  requests: `${baseUrl}/requests`,
  auth: `${baseUrl}/auth`,
  staff: `${baseUrl}/staff`,
  schedule: `${baseUrl}/schedule`,
  dashboard: `${baseUrl}/dashboard`,
  profile: `${baseUrl}/profile`,
};

// console.log(apiRoutes)