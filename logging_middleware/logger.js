const axios = require("axios");
require("dotenv").config();

const BASE_URL = process.env.BASE_URL;
const TOKEN = process.env.TOKEN;

async function Log(stack, level, packageName, message) {
    try {
        const res = await axios.post(
            `${BASE_URL}/logs`,
            {
                stack,
                level,
                package: packageName,
                message
            },
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        
        console.log("Log sent:", {
            stack,
            level,
            package: packageName,
            message
        });

        console.log("Log response:", res.data);

        return res.data;

    } catch (error) {
        console.error("Logging failed:", error.response?.data || error.message);
    }
}

module.exports = Log;