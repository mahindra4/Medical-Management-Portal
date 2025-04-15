
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllProcedures = async (req, res) => {
    try {
        const procedures = await prisma.procedure.findMany({
        });
        res.status(200).json(procedures);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch procedures' });
    }
};

const getProcedureById = async (req, res) => {
    try {
        const procedure = await prisma.procedure.findUnique({
            where: { id: req.params.id }
        });
        if (!procedure) {
            return res.status(404).json({ error: 'Procedure not found' });
        }
        res.status(200).json(procedure);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch procedure' });
    }
};

const createProcedure = async (req, res) => {
    
    try {
        const {
            id,
            inTime,
            outTime,
            patientConditionBefore,
            patientEmail, 
            patientName,  
            procedureRecord, 
            referredHospital
        } = req.body;
        

        const newProcedure = await prisma.procedure.create({
            data: { 
                id,
                patientEmail, 
                patientName, 
                inTime: new Date(inTime), 
                procedureRecord, 
                patientConditionBefore,
                referredHospital,
                outTime: outTime ? new Date(outTime) : null
            }
        });
        res.status(201).json(newProcedure);
    } catch (error) {
    
        console.error(error);
        res.status(500).json({ error: 'Failed to create procedure' });
    }
};

const updateProcedure = async (req, res) => {
    try {
        const {
            id,
            inTime,
            outTime,
            patientConditionBefore,
            patientEmail, 
            patientName,  
            procedureRecord, 
            referredHospital
        } = req.body;

        const procedure = await prisma.procedure.findUnique({
            where: { id: req.params.id },
        });

        if (!procedure) {
            return res.status(404).json({ error: 'Procedure not found' });
        }

        const updatedProcedure = await prisma.procedure.update({
            where: { id: req.params.id },
            data: { 
                id,
                patientEmail, 
                patientName, 
                inTime: inTime ? new Date(inTime) : undefined, 
                procedureRecord, 
                patientConditionBefore,
                referredHospital,
                outTime: outTime ? new Date(outTime) : null
            }
        });
        res.status(200).json(updatedProcedure);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update procedure' });
    }
};

const deleteProcedure = async (req, res) => {
    try {
        const procedure = await prisma.procedure.findUnique({
            where: { id: req.params.id },
        });
        
        if (!procedure) {
            return res.status(404).json({ error: 'Procedure not found' });
        }
        
        await prisma.procedure.delete({
            where: { id: req.params.id },
        });
        
        res.status(200).json({ message: 'Procedure deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete procedure' });
    }
};

module.exports = {
    getAllProcedures,
    getProcedureById,
    createProcedure,
    updateProcedure,
    deleteProcedure,
};
