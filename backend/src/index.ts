import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from "@prisma/extension-accelerate";
import { Context, Hono } from "hono";
import { sign } from "hono/jwt";

const app = new Hono<{
    Bindings : {
        DATABASE_URL : string,
        JWT_SECRET : string
    }
}>();

app.post("/signup",async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body =await c.req.json()
    try{
        const response = await prisma.user.create({
            data : {
                email : body.email,
                password : body.password,
            }
        })
        
        const payload = {
            id : response.id,
            email : response.email,
            password : response.password
        }

        const token = await sign(payload,c.env.JWT_SECRET);

        c.json({
            message : "user created successfully",
            token
        })
    }

    catch(e){
        c.json({
            message : "internal server error"
        })
    }
})
export default app;