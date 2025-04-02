import { SortableTable } from "../components/SortableTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'sonner';
import { apiRoutes } from "../utils/apiRoutes";
import {
  SyncLoadingScreen,
} from "../components/UI/LoadingScreen";

// const TABLE_HEAD = {
//   id: "#",
//   patientName: "Patient Name",
// //   doctorName: "Doctor",
// //   staffName: "ParaMedical Staff",
//   date: "Date",
//   time: "Time",
//   diagnosis: "Diagnosis",
//   symptoms: "Symptoms",
//   action: "Action",
// };

const TABLE_HEAD = {
    id: "#",
    opd: "OPD",
    patientName: "Patient Name",
    temperature: "Temperature",
    date: "Date",
    time: "Time",
    bloodPressure: "BP",
    pulseRate: "Pulse Rate",
    spO2: "spO2",
    action: "Action",
}

import Layout from "../layouts/PageLayout";

const getPatientVitalData = async () => {
  try {
    console.log(apiRoutes.patientVitals)
    const response = await axios.get(apiRoutes.patientVitals, {
      withCredentials: true
    });
    console.log("response", response.data.data)
    toast.success('Patient Vital List fetched successfully')
    return response.data.data;
  } catch (error) {
    console.error(`ERROR (get-patient-vital-list): ${error?.response?.data?.message}`);
    toast.error('Failed to fetch Patient Vital List')
  }
};
// import MockData from "../assets/MOCK_DATA_prescription.json";


export default function PatientVitalsList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPatientVitalData();
      console.log("data out", data);
      setPrescription(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePrescriptionDelete = async (e, id) => {
    try {
      const res = await axios.delete(`${apiRoutes.checkup}/${id}`, {
        withCredentials: true
      });
      const { data } = res;

      if (data?.ok) {
        console.log(`MESSAGE : ${data?.message}`);
        toast.success(data?.message);
        setPrescription((prev) => prev.filter((p) => p.id !== id));
      } else {
        // TODO: show an error message
        console.log(`ERROR (patient_vitals_delete): ${data.message}`);
        toast.error(
          "Failed to delete vitals"
        );
      }
    } catch (err) {
      console.error(
        `ERROR (prescription_list_delete): ${err?.response?.data?.message}`
      );
    }
  };
  const handlePrescriptionDetail = async (e, id, idx) => {
    console.log("Prescription Detail", id);
    navigate(`/prescription/${id}^${idx}`);
  };
  const handlePrescriptionUpdate = async (id) => {
    console.log("Prescription Edit", id);
    navigate(`/prescription/update/${id}`);
  };
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <SortableTable
            tableHead={TABLE_HEAD}
            title="Patient Vital List"
            data={prescription}
            detail="See information about all OPDs."
            // text="Add Prescription"
            // addLink="/prescription/add"
            handleDelete={handlePrescriptionDelete}
            searchKey="opd"
            handleDetail={handlePrescriptionDetail}
            detailsFlag={true}
            handleUpdate={handlePrescriptionUpdate}
            defaultSortOrder="date"
          />
        </Layout>
      )}
    </>
  );
}
