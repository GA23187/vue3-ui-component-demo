import {  defineClientAppEnhance } from "@vuepress/client";
import uiDesign from "ui-design";
import "ui-design/style";
console.log(uiDesign,'uiDesignuiDesignuiDesign');

export default defineClientAppEnhance(({app})=>{
    app.use(uiDesign);
})
