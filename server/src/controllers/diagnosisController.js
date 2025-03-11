const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getDiagnosisSymptomsList = async (req, res, next) => {
    try{
        const diagnosisSymptomsList = await prisma.diagnosisSymptoms.findMany();
        // console.log(diagnosisSymptomsList)
        const formattedData = diagnosisSymptomsList.reduce((acc,{diagnosis,symptom}) => {
            if(!acc[diagnosis]){
                acc[diagnosis] = []
            }
            acc[diagnosis].push(symptom);
            return acc;
        },{})

        return res.status(200).json({
            ok: true,
            data: formattedData,
            message: "Diagnosis-Symptoms List fetched successfully"
        })
        
    } catch(err){
        console.log(err);
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Diagnosis-Symptoms List Failed, Try again later"
        })
    }
}

const getDiagnosisList = async (req, res, next) => {
    try{
        const diagnosisList = await prisma.diagnosisSymptoms.findMany({
            select: {
                diagnosis: true
            }
        })
        // console.log(diagnosisList)
        const formattedData = [...new Set(diagnosisList.map(item => item.diagnosis))];
        return res.status(200).json({
            ok: true,
            data: formattedData,
            message: "Diagnosis List fetched successfully"
        })

    } catch(err){
        console.log(err);
        return res.status(500).json({
            ok: false,
            data: [],
            message: "Fetching Diagnosis List Failed, Try again later"
        })
    }
}

module.exports = {getDiagnosisSymptomsList, getDiagnosisList};