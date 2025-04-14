const { PrismaClient } = require('@prisma/client');
const formatTimeFromISO = require('../utils/formatTimeFromISO');
const { DateTime } = require('luxon');

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
            opd: vitals?.id,
            patientName: vitals.Patient?.name,
            date: vitals.date?.toISOString().split("T")[0],
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

        const vitalsList = await prisma.patientVitals.findMany({
            include: {
                Patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            where: { 
                id: patientId 
            },
            orderBy: { date: 'desc' } // Fetch latest vitals first
        });

        if (vitalsList.length === 0) {
            return res.status(404).json({ message: `No vitals found for this patient: ${patientId}` });
        }

        const vitals = vitalsList[0];
        const results = {
            id: vitals?.id,
            opd: vitals?.id,
            patientId: vitals?.Patient?.id,
            patientName: vitals?.Patient?.name,
            email: vitals?.Patient?.email,
            date: vitals?.date?.toISOString().split("T")[0],
            time: formatTimeFromISO(vitals.date),
            temperature: vitals?.temperature,
            bloodPressure: vitals?.bloodPressure,
            pulseRate: vitals?.pulseRate,
            spO2: vitals?.spO2,
        }
        console.log(vitals);
        console.log(results);

        res.status(200).json(results);
    } catch (error) {
        console.error("Error fetching patient vitals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deletePatientVitals = async (req, res) => {
    try{
        const id = req.params.id;
        if(!id){
            res.status(400).json({message: "Patient ID is Required"});
        }

        const deletedVitals = await prisma.patientVitals.deleteMany({
            where: {
                id
            }
        })
        if(deletedVitals.count){
            res.status(200).json({
                ok: true,
                message: "Deleted successfully",
            });
        }
        else{
            res.status(404).json({
                ok: false,
                message: "Patient Vital Record doesn't exist",
            });
        }
    } 
    catch(error){
        res.status(500).json({message: "Internal server error"});
    }
}


const savePatientVitals = async (req, res) => {
    try {
        const { id, patientId, temperature, date, bloodPressure, pulseRate, spO2 } = req.body;
        console.log('save patient vitals');
        console.log(req.body);
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

        const visitDate = DateTime.now().setZone('Asia/Kolkata');
        const visitTime = visitDate.toFormat('HH:mm:ss');
    
        const [hour, minute, second] = visitTime.split(':').map(Number);
    
        const combinedDateTime = DateTime.fromObject(
        {
            year: visitDate.year,
            month: visitDate.month,
            day: visitDate.day,
            hour,
            minute,
            second,
            millisecond: 0
        },
        { zone: 'Asia/Kolkata' }
        );
    
        const jsDate = combinedDateTime.toJSDate();
    
        console.log("visitingDate", visitDate);
        console.log(`Visit time: ${visitTime}`);
        console.log(`jsDate ${jsDate}`);
    
        // Format to YYYYMMDD for OPD_ID
        const formattedDate = visitDate.toFormat('yyyyLLdd');
        const dbDate = visitDate.toISODate(); 
        console.log(`formattedDate: ${formattedDate}`);
        console.log("dbDate", dbDate);
    
        const lastOpd = await prisma.opdCounter.findMany()
    
        let newCount;
        if(lastOpd.length>0){
            const lastDate = DateTime.fromISO(lastOpd[0].date, { zone: 'Asia/Kolkata' });
            const lastFormattedDate = lastDate.toFormat('yyyyLLdd');
    
            const lastCount = lastOpd[0].count;
            const counterId = lastOpd[0].id;
            // console.log("equal formatting: ",lastFormattedDate, formattedDate, visitDate, visitDate.toISOString().split('T')[0]);
            if(lastFormattedDate === formattedDate){
                newCount = lastCount+1;
            }
            else{
                newCount = 1;
            }
            console.log(counterId);
            await prisma.opdCounter.update({
                where: {id: counterId},
                data: {
                    date: dbDate,
                    count: newCount,
                }
            })
        }
        else{
            newCount = 1;
            
            await prisma.opdCounter.create({
                data: {
                    id: '1',
                    date: dbDate,
                    count: newCount
                }
            })
        }
    
            const opdId = `OPD${formattedDate}-${newCount.toString().padStart(3, '0')}`;
            console.log(`Generated OPD ID: ${opdId}`);   


        let vitals = null;
        const timeInfo = 'T' + DateTime.now().setZone('Asia/Kolkata').toISOTime({ suppressMilliseconds: true });
        console.log("id: ",id);
        if(id){
            vitals = await prisma.patientVitals.update({
                where: {id},
                data: { id,
                        patientId,
                        temperature: parseFloat(temperature),
                        date: date + timeInfo, 
                        bloodPressure, 
                        pulseRate: parseInt(pulseRate),
                        spO2: parseFloat(spO2),
                    }
            });
            await prisma.checkup.update({
                where: {id},
                data:{
                    id,
                    patientId,
                    temperature: parseFloat(temperature),
                    date: date + timeInfo, 
                    bloodPressure, 
                    pulseRate: parseInt(pulseRate),
                    spO2: parseFloat(spO2),
                }
            })
            res.status(201).json({ message: "Patient vitals updated successfully", vitals, id});
        }
        else{
            vitals = await prisma.patientVitals.create({
                data: { id: opdId,
                        patientId,
                        temperature: parseFloat(temperature),
                        date: jsDate, 
                        bloodPressure, 
                        pulseRate: parseInt(pulseRate),
                        spO2: parseFloat(spO2),
                    }
            });
            res.status(201).json({ message: "Patient vitals saved successfully", vitals , id });
        }
    } catch (error) {
        console.error("Error saving patient vitals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


module.exports = { getPatientVitals, savePatientVitals, getPatientVitalsList, deletePatientVitals};
