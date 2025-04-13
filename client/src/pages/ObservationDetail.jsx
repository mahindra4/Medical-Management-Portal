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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@material-tailwind/react";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { toast } from "sonner";

const OBSERVATION_TABLE_HEAD = ["Medicine", "Dosage", "Frequency", "Daily Qty", "Days", "Total Qty"];

const ObservationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [observationData, setObservationData] = useState(null);

  const handlePrint = () => {
    if (!observationData) return;
    
    const element = document.getElementById("observationDetail");
    const pdfName = `Observation_${observationData.patientName}_${observationData.date}`;
    const options = {
      margin: 10,
      filename: pdfName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(options).save();
  };

  const fetchObservationDetail = async () => {
    try {
      const response = await axios.get(`${apiRoutes.observation}/${id}`, {
        withCredentials: true
      });
      
      if (!response.data) {
        throw new Error("No observation data received");
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching observation:", error);
      toast.error(error.response?.data?.message || "Failed to fetch observation");
      throw error;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchObservationDetail();
        
        if (!data.data) {
          throw new Error("Invalid observation data structure");
        }

        const observation = data.data;
        
        const formattedData = {
          id: observation.id,
          patientName: observation.patientName || "-",
          doctorName: observation.doctorName || "-",
          staffName: observation.staffName || "-",
          date: observation.checkup?.date ? new Date(observation.checkup.date).toLocaleDateString() : "-",
          time: observation.checkup?.date ? new Date(observation.checkup.date).toLocaleTimeString() : "-",
          temperature: observation.checkup?.temperature ?? "-",
          bloodPressure: observation.checkup?.bloodPressure || "-",
          spO2: observation.checkup?.spO2 ?? "-",
          pulseRate: observation.checkup?.pulseRate ?? "-",
          diagnosis: observation.checkup?.diagnosis || "-",
          symptoms: observation.checkup?.symptoms || "-",
          referredDoctor: observation.checkup?.referredDoctor || "-",
          referredHospital: observation.checkup?.referredHospital || "-",
          isUnderObservation: observation.isUnderObservation || false,
          medicines: observation.observationMedicines || []
        };

        setObservationData(formattedData);
      } catch (error) {
        console.error("Error loading observation:", error);
        toast.error("Failed to load observation details");
        navigate("/observation");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  if (loading) return <SyncLoadingScreen />;
  if (!observationData) return <div>No observation data found</div>;

  return (
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
              onClick={() => navigate(`/observation/update/${id}`)}
            >
              Edit
            </Button>
            <Button
              size="md"
              className="flex gap-x-1 px-4"
              onClick={handlePrint}
            >
              <PrinterIcon className="h-4" /> Print
            </Button>
            <Button
              size="md"
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
                src="/src/assets/img/iitroparlogo0.jpg"
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 pl-6 pr-6">
              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" className="font-bold text-gray-700">
                  Doctor Name
                </Typography>
                <Typography variant="paragraph">
                  {observationData.doctorName}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" className="font-bold text-gray-700">
                  Staff Name
                </Typography>
                <Typography variant="paragraph">
                  {observationData.staffName}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" className="font-bold text-gray-700">
                  Patient Name
                </Typography>
                <Typography variant="paragraph">
                  {observationData.patientName}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <Typography variant="small" className="font-bold text-gray-700">
                  Date & Time
                </Typography>
                <Typography variant="paragraph">
                  {observationData.date} {observationData.time}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" className="font-bold text-gray-700">
                  Temperature (°C)
                </Typography>
                <Typography variant="paragraph">
                  {observationData.temperature}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" className="font-bold text-gray-700">
                  Blood Pressure
                </Typography>
                <Typography variant="paragraph">
                  {observationData.bloodPressure}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" className="font-bold text-gray-700">
                  SpO2 (%)
                </Typography>
                <Typography variant="paragraph">
                  {observationData.spO2}
                </Typography>
              </div>
              
              <div>
                <Typography variant="small" className="font-bold text-gray-700">
                  Pulse Rate (bpm)
                </Typography>
                <Typography variant="paragraph">
                  {observationData.pulseRate}
                </Typography>
              </div>
              
              <div className="col-span-2">
                <Typography variant="small" className="font-bold text-gray-700">
                  Status
                </Typography>
                <Typography 
                  variant="paragraph" 
                  color={observationData.isUnderObservation ? "green" : "gray"}
                >
                  {observationData.isUnderObservation ? "Under Observation" : "Not Under Observation"}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-4">
                <Typography variant="small" className="font-bold text-gray-700">
                  Diagnosis
                </Typography>
                <Typography variant="paragraph">
                  {observationData.diagnosis}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-4">
                <Typography variant="small" className="font-bold text-gray-700">
                  Symptoms
                </Typography>
                <Typography variant="paragraph">
                  {observationData.symptoms}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-4">
                <Typography variant="small" className="font-bold text-gray-700">
                  Referred Doctor
                </Typography>
                <Typography variant="paragraph">
                  {observationData.referredDoctor}
                </Typography>
              </div>
              
              <div className="col-span-2 md:col-span-4">
                <Typography variant="small" className="font-bold text-gray-700">
                  Referred Hospital
                </Typography>
                <Typography variant="paragraph">
                  {observationData.referredHospital}
                </Typography>
              </div>
            </div>

            {/* Observation Treatment */}
            {observationData.isUnderObservation && observationData.medicines.length > 0 && (
              <div className="w-full pt-6">
                <Typography variant="h5" color="blue-gray" className="mb-4">
                  Observation Treatment Plan
                </Typography>
                <Table className="min-w-full">
                  <TableHead>
                    <TableRow>
                      {OBSERVATION_TABLE_HEAD.map((head) => (
                        <TableCell key={head} className="bg-blue-gray-50">
                          <Typography variant="small" className="font-bold">
                            {head}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {observationData.medicines.map((medicine, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.brandName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.dosage}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.frequency}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.dailyQuantity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.days}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="small">
                            {medicine.totalQuantity}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </Layout>
  );
};

export default ObservationDetail;