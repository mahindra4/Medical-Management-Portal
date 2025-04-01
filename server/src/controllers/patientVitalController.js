const { PrismaClient } = require('@prisma/client');
const formatTimeFromISO = require('../utils/formatTimeFromISO');

const prisma = new PrismaClient();


const getPatientVitalsList = async (req, res) => {
    try {
        const vitalsList = await prisma.patientVitals.findMany({
            include: {
                Patient: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                date: 'desc', // Fetch latest vitals first
            },
        });

        if (vitalsList.length === 0) {
            return res.status(404).json({ message: `No vitals found for this patient: ${patientId}` });
        }

        const restructuredVitalsList = vitalsList.map((vitals) => ({
            id: vitals?.id,
            patientName: vitals.Patient?.name,
            date: vitals.date.toISOString().split("T")[0],
            time: formatTimeFromISO(vitals.date),
            // date: vitals?.date,
            temperature: vitals?.temperature,
            bloodPressure: vitals?.bloodPressure,
            pulseRate: vitals?.pulseRate,
            spO2: vitals?.spO2,
        }));

        return res.status(200).json({
            ok: true,
            data: restructuredVitalsList,
            message: "Vitals List retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching patient vitals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getPatientVitals = async (req, res) => {
    try {
        const patientId = req.params.id;

        if (!patientId) {
            return res.status(400).json({ message: "Patient ID is required" });
        }

        const vitals = await prisma.patientVitals.findMany({
            where: { patientId },
            orderBy: { date: 'desc' } // Fetch latest vitals first
        });

        if (vitals.length === 0) {
            return res.status(404).json({ message: `No vitals found for this patient: ${patientId}` });
        }

        res.json(vitals);
    } catch (error) {
        console.error("Error fetching patient vitals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const savePatientVitals = async (req, res) => {
    try {
        const { patientId, temperature, date, bloodPressure, pulseRate, spO2 } = req.body;

        if (!patientId || !date) {
            return res.status(400).json({ message: "Patient ID and date are required" });
        }

        // Check if patient exists
        const existingPatient = await prisma.patient.findUnique({
            where: { id: patientId }
        });

        if (!existingPatient) {
            return res.status(404).json({ message: "Patient does not exist" });
        }

        // Generate OPD_ID
        let currentdate = new Date();
        const visitDateString = new Date().toLocaleString("en-US", { timeZone: 'Asia/Kolkata' });

        console.log(`visited date: ${visitDateString}`);

        // Convert visitDateString back to Date object to use getFullYear(), getMonth(), etc.
        const visitDate = new Date(visitDateString);

        // Format to YYYYMMDD for OPD_ID
        const formattedDate = visitDate.getFullYear().toString() +
                            (visitDate.getMonth() + 1).toString().padStart(2, '0') +
                            visitDate.getDate().toString().padStart(2, '0');

        console.log(`formattedDate: ${formattedDate}`);

        // Count existing OPD records for the same date
        const existingCount = await prisma.patientVitals.count({
            where: {
                date: {
                    gte: new Date(visitDate.setHours(0, 0, 0, 0)), // Start of the day
                    lt: new Date(visitDate.setHours(23, 59, 59, 999)) // End of the day
                }
            }
        });
        
        console.log(`existing count = ${existingCount}`)
        // Increment counter
        const counter = (existingCount + 1).toString().padStart(3, '0'); // 001, 002, etc.

        // Construct OPD_ID
        console.log(`formatted date: ${formattedDate}`);
        const opdId = `OPD${formattedDate}-${counter}`;

        // Insert new patient vitals
        let timeInfo = new Date();
        timeInfo = timeInfo.toISOString();
        timeInfo = "T" + timeInfo.split('T')[1];

        const newVitals = await prisma.patientVitals.create({
            data: { id: opdId,
                    patientId,
                    temperature: parseFloat(temperature),
                    date: date + timeInfo, 
                    bloodPressure, 
                    pulseRate: parseInt(pulseRate),
                    spO2: parseFloat(spO2),
                }
        });

        res.status(201).json({ message: "Patient vitals saved successfully", vitals: newVitals });
    } catch (error) {
        console.error("Error saving patient vitals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { getPatientVitals, savePatientVitals, getPatientVitalsList };
