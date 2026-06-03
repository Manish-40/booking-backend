const express=require("express");
const pool=require("../config/db");
const router=express.Router();
router.get("/search",async(req,res)=>{
    try
    {
        const search=req.query.q;
        const result=await pool.query("SELECT * FROM movies WHERE title ILIKE $1",[`${search}%`]);
        res.json(result.rows);
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("search error");
    }
});
router.get("/moviesDescription/:moviename",async(req,res)=>{
    try
    {
        const {moviename}=req.params;
        console.log(moviename);
        const result=await pool.query("SELECT * FROM movies WHERE title=$1",[moviename]);
        res.json(result.rows);
    }
    catch(error)
    {
        console.log(error);
        res.status(500).send("error");
    }
})
module.exports=router;