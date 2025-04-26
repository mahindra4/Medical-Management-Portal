const {PrismaClient} = require("@prisma/client");
const { get } = require("../routes/purchaseRoutes");
const prisma = new PrismaClient();

const getHospitalList = async (req, res, next) => {
    try {
        const response = await prisma.hospitals.findMany({
            select: {
                id: true,
                name: true
            }
        });
        
        res.status(200).json({
            ok: true,
            data: response,
            message: "Hospital List was successfully fetched"
        })
    } catch(err){
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Fetching hospitalList failed, Try again'
        })
    }
}

const addHospital = async (req, res, next) => {
    try {
        // Extract hospital name from request body
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            return res.status(400).json({
                ok: false,
                message: 'Hospital name is required'
            });
        }

        // Check if hospital already exists
        const existingHospital = await prisma.hospitals.findFirst({
            where: {
                name: name
            }
        });

        if (existingHospital) {
            return res.status(409).json({
                ok: false,
                message: 'Hospital with this name already exists'
            });
        }

        // Create new hospital
        const newHospital = await prisma.hospitals.create({
            data: {
                name: name
            }
        });

        res.status(201).json({
            ok: true,
            data: newHospital,
            message: 'Hospital was successfully added'
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            message: 'Adding hospital failed, try again'
        });
    }
};

const updateHospital = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        // Validate input
        if (!name || name.trim() === '') {
            return res.status(400).json({
                ok: false,
                message: 'Hospital name is required'
            });
        }

        // Check if hospital exists
        const hospital = await prisma.hospitals.findUnique({
            where: {
                id: id
            }
        });

        if (!hospital) {
            return res.status(404).json({
                ok: false,
                message: 'Hospital not found'
            });
        }

        // Check if another hospital with the same name exists
        const existingHospital = await prisma.hospitals.findFirst({
            where: {
                name: name,
                id: {
                    not: id
                }
            }
        });

        if (existingHospital) {
            return res.status(409).json({
                ok: false,
                message: 'Another hospital with this name already exists'
            });
        }

        // Update hospital
        const updatedHospital = await prisma.hospitals.update({
            where: {
                id: id
            },
            data: {
                name: name
            }
        });

        res.status(200).json({
            ok: true,
            data: updatedHospital,
            message: 'Hospital was successfully updated'
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            message: 'Updating hospital failed, try again'
        });
    }
};

const deleteHospital = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if hospital exists
        const hospital = await prisma.hospitals.findUnique({
            where: {
                id: id
            }
        });

        if (!hospital) {
            return res.status(404).json({
                ok: false,
                message: 'Hospital not found'
            });
        }

        // Delete hospital
        await prisma.hospitals.delete({
            where: {
                id: id
            }
        });

        res.status(200).json({
            ok: true,
            message: 'Hospital was successfully deleted'
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            message: 'Deleting hospital failed, try again'
        });
    }
};


const getHospitalById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const hospital = await prisma.hospitals.findUnique({
            where: {
                id: id
            }
        });

        if (!hospital) {
            return res.status(404).json({
                ok: false,
                message: 'Hospital not found'
            });
        }

        res.status(200).json({
            ok: true,
            data: hospital,
            message: 'Hospital details fetched successfully'
        });
    } catch (err) {
        return res.status(500).json({
            ok: false,
            message: 'Fetching hospital details failed, try again'
        });
    }
};

module.exports = {
    getHospitalList,
    addHospital,
    updateHospital,
    deleteHospital,
    getHospitalById
};
