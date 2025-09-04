declare module "*.css";
declare module "*.svg" {
  const content: string;
  export default content;
}
import '/index.css'