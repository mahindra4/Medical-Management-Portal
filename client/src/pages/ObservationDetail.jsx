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

const PRESCRIPTION_TABLE_HEAD = ["Medicine", "Dosage", "Quantity"];
const OBSERVATION_TABLE_HEAD = ["Medicine", "Dosage", "Frequency", "Daily Qty", "Days", "Total Qty"];

const ObservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const params = id.split("^");
  const observationId = params[0];
  const opdId = params[1];
  
  const [loading, setLoading] = useState(true);
  const [observationData, setObservationData] = useState({
    patientName: "-",
    doctorName: "-",
    staffName: "-",
    date: "-",
    time: "-",
    temperature: "-",
    bloodPressure: "-",
    spO2: "-",
    pulseRate: "-",
    diagnosis: "-",
    symptoms: "-",
    referredDoctor: "-",
    referredHospital: "-",
    isUnderObservation: false,
    checkupMedicines: [],
    observationDetails: []
  });

  const handlePrint = () => {
    const element = document.getElementById("observationDetail");
    const pdfName = `Observation_${observationData.patientName}_${observationData.date}`;
    html2pdf().from(element).set({ filename: pdfName }).save();
  };

  const fetchObservationDetail = async () => {
    try {
      const response = await axios.get(
        `${apiRoutes.observation}/${observationId}`,
        { withCredentials: true }
      );
      console.log("Observation response", response.data.data);
      setToastTimeout(
        "success",
        "Observation Details fetched successfully",
        1000
      );
      return response.data.data;
    } catch (error) {
      console.error(
        `ERROR (get-observation-detail): ${error?.response?.data?.message}`
      );
      setToastTimeout("error", "Failed to fetch Observation Details", 1000);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchObservationDetail();
      console.log("Observation data out", data);

      const formattedData = {
        patientName: data.checkup?.Patient?.name || "-",
        doctorName: data.checkup?.Doctor?.name || "-",
        staffName: data.checkup?.Staff?.name || "-",
        date: data.checkup?.date ? new Date(data.checkup.date).toLocaleDateString() : "-",
        time: data.checkup?.date ? new Date(data.checkup.date).toLocaleTimeString() : "-",
        temperature: data.checkup?.temperature || "-",
        bloodPressure: data.checkup?.bloodPressure || "-",
        spO2: data.checkup?.spO2 || "-",
        pulseRate: data.checkup?.pulseRate || "-",
        diagnosis: data.checkup?.diagnosis || "-",
        symptoms: data.checkup?.symptoms || "-",
        referredDoctor: data.checkup?.referredDoctor || "-",
        referredHospital: data.checkup?.referredHospital || "-",
        isUnderObservation: data.isUnderObservation || false,
        checkupMedicines: data.checkup?.checkupMedicines || [],
        observationDetails: data.observation ? [{
          medicineName: data.observation.medicine?.brandName || "-",
          dosage: data.observation.dosage || "-",
          frequency: data.observation.frequency || "-",
          dailyQuantity: data.observation.dailyQuantity || "-",
          days: data.observation.days || "-",
          totalQuantity: (data.observation.dailyQuantity || 0) * (data.observation.days || 0)
        }] : []
      };
      
      setObservationData(formattedData);
      setLoading(false);
    };

    loadData();
  }, []);

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <div className="flex flex-col self-center lg:w-2/3 h-max">
            <div className="flex flex-col sm:flex-row justify-between py-2">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-2">
                  Observation Details
                </Typography>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Date: {observationData.date}
                </Typography>
              </div>
              <div className="flex gap-x-2 h-10">
                <Button 
                  size="md" 
                  ripple={true} 
                  onClick={() => navigate(`/observation/update/${observationId}`)}
                >
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
                  onClick={() => navigate("/observation")}
                >
                  Close
                </Button>
              </div>
            </div>
            <Card id="observationDetail" className="w-full h-fit min-h-lvh">
              <CardBody>
                <div className="flex flex-col sm:flex-row border-b border-black p-2 items-center w-full">
                  <img
                    src="\src\assets\img\iitroparlogo0.jpg"
                    alt="logo"
                    className="px-4 w-fit h-24 rounded-none"
                  />
                  <div className="w-full h-full">
                    <Typography color="blue-gray" className="text-xl md:text-3xl text-center sm:text-start font-semibold font-serif">
                      Indian Institute of Technology Ropar
                    </Typography>
                    <Typography color="blue-gray" className="text-base md:text-xl text-center sm:text-start font-medium">
                      Medical center / Rupnagar - 140001, Punjab, India
                    </Typography>
                    <Typography className="text-end text-sm md:text-base font-semibold">
                      Observation Slip
                    </Typography>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 pl-10 justify-items-left">
                  <Typography variant="small">OPD Id</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {opdId}
                  </Typography>
                  <Typography variant="small">Doctor Name</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.doctorName}
                  </Typography>
                  <Typography variant="small">Staff Name</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.staffName}
                  </Typography>
                  <Typography variant="small">Patient Name</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.patientName}
                  </Typography>
                  <Typography variant="small">Date</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.date} ({observationData.time})
                  </Typography>
                  <Typography variant="small">Temperature</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.temperature}
                  </Typography>
                  <Typography variant="small">Blood Pressure</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.bloodPressure}
                  </Typography>
                  <Typography variant="small">SpO2</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.spO2}
                  </Typography>
                  <Typography variant="small">Pulse Rate</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.pulseRate}
                  </Typography>
                  <Typography variant="small">Status</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium">
                    {observationData.isUnderObservation ? "Under Observation" : "Not Under Observation"}
                  </Typography>
                  <Typography variant="small">Diagnosis</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium md:col-span-3">
                    {observationData.diagnosis}
                  </Typography>
                  <Typography variant="small">Symptoms</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium md:col-span-3">
                    {observationData.symptoms}
                  </Typography>
                  <Typography variant="small">Referred Doctor</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium md:col-span-3">
                    {observationData.referredDoctor}
                  </Typography>
                  <Typography variant="small">Referred Hospital</Typography>
                  <Typography variant="paragraph" color="blue-gray" className="font-medium md:col-span-3">
                    {observationData.referredHospital}
                  </Typography>
                </div>

                {/* Prescription Medicines Table */}
                {observationData.checkupMedicines.length > 0 && (
                  <div className="w-full pt-4">
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Prescription Medicines
                    </Typography>
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          {PRESCRIPTION_TABLE_HEAD.map((head) => (
                            <th key={head} className="border-y border-blue-gray-100 bg-blue-gray-50 p-4">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70 text-center">
                                {head}
                                {head === "Dosage" && "*"}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {observationData.checkupMedicines.map((medicine, index) => (
                          <tr key={index} className="text-center border-b border-blue-gray-50">
                            <td>
                              <Typography variant="small" className="font-normal p-4">
                                {medicine.brandName}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {medicine.dosage}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {medicine.quantity}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Observation Treatment Table */}
                {observationData.isUnderObservation && observationData.observationDetails.length > 0 && (
                  <div className="w-full pt-4">
                    <Typography variant="h6" color="blue-gray" className="mb-2">
                      Observation Treatment Plan
                    </Typography>
                    <table className="w-full min-w-max table-auto text-left">
                      <thead>
                        <tr>
                          {OBSERVATION_TABLE_HEAD.map((head) => (
                            <th key={head} className="border-y border-blue-gray-100 bg-blue-gray-50 p-4">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70 text-center">
                                {head}
                              </Typography>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {observationData.observationDetails.map((detail, index) => (
                          <tr key={index} className="text-center border-b border-blue-gray-50">
                            <td>
                              <Typography variant="small" className="font-normal p-4">
                                {detail.medicineName}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {detail.dosage}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {detail.frequency}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {detail.dailyQuantity}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {detail.days}
                              </Typography>
                            </td>
                            <td>
                              <Typography variant="small" className="font-normal">
                                {detail.totalQuantity}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </Layout>
      )}
    </>
  );
};

export default ObservationDetail;