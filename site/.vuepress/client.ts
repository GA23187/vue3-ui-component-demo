import {  defineClientConfig } from "@vuepress/client";
import uiDesign from "ui-design";
import "ui-design/style";
console.log(uiDesign,'uiDesignuiDesignuiDesign');

export default defineClientConfig({
    enhance({app}){
        app.use(uiDesign)
    }
})
