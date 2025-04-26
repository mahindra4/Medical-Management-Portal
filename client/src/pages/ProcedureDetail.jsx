import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { PrinterIcon } from "@heroicons/react/24/solid";
import {
  Card,
  Typography,
  Button,
  CardBody,
  CardFooter,
} from "@material-tailwind/react";
import Layout from "../layouts/PageLayout";
import html2pdf from "html2pdf.js";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import { toast } from "sonner";
import { setToastTimeout } from "../utils/customTimeout";

const ProcedureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [procedureData, setProcedureData] = useState({
    id: "",
    patientEmail: "",
    patientName: "",
    inTime: "",
    procedureRecord: "",
    patientConditionBefore: "",
    referredHospital: "",
    outTime: ""
  });
  
  console.log("procedure detail id: ", id);

  const handlePrint = () => {
    const element = document.getElementById("procedureDetail");
    const pdfName = `Procedure-${procedureData.id}-${procedureData.patientName}`;
    html2pdf().from(element).set({ filename: pdfName }).save();
  };

  const fetchProcedureDetail = async () => {
    try {
      const response = await axios.get(apiRoutes.Procedure + `/${id}`, {
        withCredentials: true
      });
      console.log("response", response.data);
      setToastTimeout('success', 'Procedure Details fetched successfully', 1000);
      return response.data;
    } catch (error) {
      console.error(
        `ERROR (get-procedure-detail): ${error?.response?.data?.message}`
      );
      setToastTimeout('error', `${error?.response?.data?.message}` || 'Failed to fetch Procedure Details', 1000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchProcedureDetail();
      console.log("data out", data);
      setProcedureData(data);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <div className="flex flex-col self-center lg:w-2/3 h-max">
            <div className="flex flex-col sm:flex-row justify-between py-2">
              <div>
                <Typography variant="h4" color="blue-gray" className="mb-2">
                  Procedure Details
                </Typography>
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  OPD Number: {procedureData.id}
                </Typography>
              </div>
              <div className="flex gap-x-2 h-10">
                <Button size="md" ripple={true} onClick={() => navigate(`/procedure/update/${id}`)}>
                  Edit
                </Button>
                <Button size="md" ripple={true} className="flex gap-x-1 px-4" onClick={handlePrint}>
                  <PrinterIcon className="h-4" /> Print
                </Button>
                <Button size="md" ripple={true} className="flex gap-x-1 px-4" onClick={() => navigate("/procedure")}>
                  Close
                </Button>
              </div>
            </div>
            <Card id="procedureDetail" className="w-full h-fit min-h-lvh">
              <CardBody>
                <div className="flex border-b border-black p-2">
                  <img
                    src="\src\assets\img\iitroparlogo0.jpg"
                    alt="logo"
                    className="px-4 w-fit h-24 rounded-none"
                  />
                  <div className="w-full">
                    <Typography variant="h3" color="blue-grey" className="">
                      Indian Institute of Technology Ropar
                    </Typography>
                    <Typography variant="h5" color="blue-grey" className="">
                      Medical center / Rupnagar - 140001, Punjab, India
                    </Typography>
                    <Typography
                      variant="h5"
                      color="blue-grey"
                      className="text-end"
                    >
                      Phone: 1234567890
                    </Typography>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 pt-4 pl-10 justify-items-left">
                  <Typography variant="small">OPD Number</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.id}
                  </Typography>

                  <Typography variant="small">Patient Name</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.patientName}
                  </Typography>

                  <Typography variant="small">Email</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.patientEmail}
                  </Typography>

                  <Typography variant="small">In Time</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.inTime ? new Date(procedureData.inTime).toLocaleString() : "N/A"}
                  </Typography>

                  <Typography variant="small">Out Time</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.outTime ? new Date(procedureData.outTime).toLocaleString() : "N/A"}
                  </Typography>

                  <Typography variant="small">Referred Hospital</Typography>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-2 font-medium"
                  >
                    {procedureData.referredHospital || "N/A"}
                  </Typography>
                </div>
                
                {/* Patient Condition Before */}
                <div className="pt-6 pl-10">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Patient Condition Before Procedure
                  </Typography>
                  <div className="pl-4 pr-10">
                    <Typography variant="small" className="font-normal whitespace-pre-wrap">
                      {procedureData.patientConditionBefore || "Not specified"}
                    </Typography>
                  </div>
                </div>

                {/* Procedure Record Details */}
                <div className="pt-6 pl-10">
                  <Typography variant="h6" color="blue-gray" className="mb-2">
                    Procedure Details
                  </Typography>
                  <div className="pl-4 pr-10">
                    <Typography variant="small" className="font-normal whitespace-pre-wrap">
                      {procedureData.procedureRecord}
                    </Typography>
                  </div>
                </div>
              </CardBody>
              <CardFooter className="p-4">
                <Typography variant="small" className="text-center text-gray-600">
                  This is a computer-generated document and does not require a signature.
                </Typography>
              </CardFooter>
            </Card>
          </div>
        </Layout>
      )}
    </>
  );
};

export default ProcedureDetail;
