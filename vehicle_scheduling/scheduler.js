const axios = require("axios");
require("dotenv").config();

const Log = require("../logging_middleware/logger");

const BASE_URL = process.env.BASE_URL;
const TOKEN = process.env.TOKEN;

// Fetch depots
async function fetchDepots() {
    await Log("backend", "info", "service", "Fetching depots data");

    const res = await axios.get(`${BASE_URL}/depots`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });

    return res.data.depots;
}

// Fetch vehicles
async function fetchVehicles() {
    await Log("backend", "info", "service", "Fetching vehicles data");

    const res = await axios.get(`${BASE_URL}/vehicles`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
    });

    return res.data.vehicles;
}

// KNAPSACK (Optimal Selection)
function knapsack(tasks, capacity) {
    const n = tasks.length;
    const dp = Array.from({ length: n + 1 }, () =>
        Array(capacity + 1).fill(0)
    );

    for (let i = 1; i <= n; i++) {
        const duration = tasks[i - 1].Duration;
        const impact = tasks[i - 1].Impact;

        for (let w = 0; w <= capacity; w++) {
            if (duration <= w) {
                dp[i][w] = Math.max(
                    dp[i - 1][w],
                    impact + dp[i - 1][w - duration]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    return dp[n][capacity];
}

// MAIN EXECUTION
async function runScheduler() {
    try {
        await Log("backend", "info", "controller", "Scheduler started");

        const depots = await fetchDepots();
        const vehicles = await fetchVehicles();

        for (const depot of depots) {
            const capacity = depot.MechanicHours;

            await Log(
                "backend",
                "info",
                "service",
                `Processing depot ${depot.ID} with capacity ${capacity}`
            );

            const maxImpact = knapsack(vehicles, capacity);

            await Log(
                "backend",
                "debug",
                "service",
                `Computed max impact = ${maxImpact}`
            );

            console.log(`Depot ${depot.ID}: Max Impact = ${maxImpact}`);
        }

        await Log("backend", "info", "controller", "Scheduler completed");

    } catch (error) {
        await Log("backend", "fatal", "handler", error.message);
        console.error(error.message);
    }
}

module.exports = runScheduler;