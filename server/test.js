const { PrismaClient } = require('@prisma/client');
const { DateTime } = require('luxon');
const prisma = new PrismaClient();
const test = async () => {

    // Convert visitDateString back to Date object to use getFullYear(), getMonth(), etc.
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
}

test();