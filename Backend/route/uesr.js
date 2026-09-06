
const { Router } = require('express');
const User = require('../model/user');

const router = Router();

router.get("/signup", (req, res) => {
    res.render("signup");
});

router.get("/signin", (req, res) => {
    res.render("signin");
});

router.post("/signup", async (req, res) => {
    const { fullname, email, password } = req.body;
    console.log("Received data:", req.body); // Debug log
    await User.create({ fullname, email, password });
    return res.redirect("/");
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.mstchPasswordAndtokenGenerator(email, password);
        console.log("Login successful:");
        // TODO: Create session/JWT token here
        return res.cookie("token", token).redirect("/");
    } catch (error) {
        return res.render("signin", { 
            error: "Invalid email or password" 
        });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    return res.redirect("/");
});

module.exports = router;
