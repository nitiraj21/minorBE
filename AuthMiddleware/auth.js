const jwt = require("jsonwebtoken");

const authenticateUser = (req,res, next) =>{
    const token = req.headers.token;

    if(!token) return res.status(401).json({error : "Access Denied. No token Provided"});

    try{
        const decoded = jwt.verify(token,process.env.JWT_USER_PASSWORD);
        req.user = decoded;
        next();
    }
    catch(error){
        res.status(400).json({error : "invalid token"});
    }
    
}

const authenticateAdmin = (req, res, next) => {
    const token = req.headers.token;

    if (!token) return res.status(401).json({ error: "Access Denied. No token Provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_PASSWORD);
        if (!decoded.isAdmin) return res.status(403).json({ error: "Access denied. Admins only." });

        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token" });
    }
};


module.exports = {authenticateAdmin, authenticateUser};