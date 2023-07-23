import axios from "axios";

const instance = axios.create({
    baseURL : 'https://devapi.inkpaper.ai/api-service/inkbot/',
    timeout : 100000,
});
  
export default instance;