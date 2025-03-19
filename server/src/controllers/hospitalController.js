const {PrismaClient} = require("@prisma/client");
const { get } = require("../routes/purchaseRoutes");
const prisma = new PrismaClient();

const getHospitalList = async (req, res, next) => {
    try {
        const response = await prisma.hospitals.findMany({
            select: {
                name: true
            }
        });

        const hospitalList = response.map(data => data.name);
        res.status(200).json({
            ok: true,
            data: hospitalList,
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

module.exports = getHospitalList;