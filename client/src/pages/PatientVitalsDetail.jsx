import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiRoutes } from "../utils/apiRoutes";
import axios from "axios";
import html2pdf from "html2pdf.js";
import { PrinterIcon } from "@heroicons/react/24/solid";
import {
  Card,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { toast } from "sonner";
import { setToastTimeout } from "../utils/customTimeout";
const TABLE_HEAD = ["Medicine", "Dosage", "Quantity"];

const PatientVitalsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const params = id.split("^");
  const patientVitalsId = params[0];
  const opdId = params[1];

  console.log(`id: ${id}, patientVitalsId: ${patientVitalsId}, opdId: ${opdId}`);
  // console.log(patientVitalsId)
  const [loading, setLoading] = useState(true);
  const [patientVitalsData, setPatientVitalsData] = useState({
    patientName: "-",
    // doctorName: "-",
    date: "-",
    time: "-",
    temperature: "-",
    bloodPressure: "-",
    spO2: "-",
    pulseRate: "-",
    // diagnosis: "-",
    // symptoms: "-",
    // referredDoctor: "-",
    // referredHospital: "-",
    // checkupMedicines: [],
  });
  const handlePrint = () => {
    const element = document.getElementById("prescriptionDetail");
    const pdfName = `Prescription_${patientVitalsData.patientName}_${patientVitalsData.date}`;
    html2pdf().from(element).set({ filename: pdfName }).save();
  };

  const fetchPatientVitalsDetail = async () => {
    try {
        console.log("path: "+apiRoutes.patientVitals + `/${patientVitalsId}`);
      const response = await axios.get(
        apiRoutes.patientVitals + `/${patientVitalsId}`,
        {
          withCredentials: true,
        }
      );
      console.log("response", response.data);
      setToastTimeout(
        "success",
        "Prescription Details fetched successfully",
        1000
      );
      return response.data;
    } catch (error) {
      console.error(
        `ERROR (get-prescription-detail): ${error?.response?.data?.message}`
      );
      setToastTimeout("error", "Failed to fetch Prescription Details", 1000);
    }
  };

  useEffect(
    () => async () => {
      const data = await fetchPatientVitalsDetail();
      console.log("data out", data);

      const data_ = {
        patientName: data.patientName || "-",
        date: data.date || "-",
        time: data.time || "-",
        temperature: data.temperature || "-",
        bloodPressure: data.bloodPressure || "-",
        spO2: data.spO2 || "-",
        pulseRate: data.pulseRate || "-",
      }
      setPatientVitalsData(data_);
      setLoading(false);
    },
    []
  );
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <div className="flex flex-col self-center lg:w-2/3 h-max">
            <div className="flex flex-col sm:flex-row justify-between py-2">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-2">
                  Patient Vital Details
                </Typography>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Date: {patientVitalsData.date}
                </Typography>
              </div>
              <div className="flex gap-x-2 h-10">
                <Button size="md" ripple={true} onClick={()=>navigate(`/patient_vitals/update/${patientVitalsId}`)}>
                  Edit
                </Button>
                <Button
                  size="md"
                  ripple={true}
                  className="flex gap-x-1 px-4"
                  onClick={handlePrint}
                >
                  <PrinterIcon className="h-4" /> Print
                </Button>
                <Button
                  size="md"
                  ripple={true}
                  onClick={() => navigate("/patient_vitals")}
                >
                  Close
                </Button>
              </div>
            </div>
            <Card id="prescriptionDetail" className="w-full h-fit min-h-lvh">
              <CardBody>
                <div className="flex flex-col sm:flex-row border-b border-black p-2 items-center w-full">
                  <img
                    src="\src\assets\img\iitroparlogo0.jpg"
                    alt="logo"
                    className="px-4 w-fit h-24 rounded-none"
                  />
                  <div className="w-full h-full">
                    <Typography  color="blue-gray" className="text-xl md:text-3xl text-center sm:text-start font-semibold font-serif">
                      Indian Institute of Technology Ropar
                    </Typography>
                    <Typography color="blue-gray" className="text-base md:text-xl text-center sm:text-start font-medium">
                      Medical center / Rupnagar - 140001, Punjab, India
                    </Typography>
                    <Typography
                      className="text-end text-sm md:text-base font-semibold"
                    >
                      OPD Slip
                    </Typography>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 pl-10 justify-items-left">
                    <Typography variant="small">OPD Id</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsId}
                    </Typography>
                    <Typography variant="small">Patient Name</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.patientName}
                    </Typography>
                    <Typography variant="small">Date</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.date} ({patientVitalsData.time})
                    </Typography>
                    <Typography variant="small">Temperature</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.temperature}
                    </Typography>
                    <Typography variant="small">Blood Pressure</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.bloodPressure}
                    </Typography>
                    <Typography variant="small">SpO2</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.spO2}
                    </Typography>
                    <Typography variant="small">Pulse Rate</Typography>
                    <Typography
                      variant="paragraph"
                      color="blue-gray"
                      className="font-medium"
                    >
                      {patientVitalsData.pulseRate}
                    </Typography>
                </div>
              </CardBody>
            </Card>
          </div>
        </Layout>
      )}
    </>
  );
};

export default PatientVitalsDetail;
