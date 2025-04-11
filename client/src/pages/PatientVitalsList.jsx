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
  const [patientVitals, setPatientVitals] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const data = await getPatientVitalData();
      console.log("data out", data);
      setPatientVitals(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePatientVitalsDelete = async(e, id) => {
    try{

      const res = await axios.delete(`${apiRoutes.patientVitals}/${id}`,{
        withCredentials: true
      })
      const {data} = res;
      if(data?.ok){
        console.log(`MESSAGE : ${data?.message}`);
        toast.success(data?.message);
        setPatientVitals((prev) => prev.filter((p) => p.id != id));
      }
      else{
         console.log(`ERROR (patient_vitals_delete): ${data.message}`);
         toast.error(
           "Failed to delete vitals"
         );
      }

    } catch(error){
      console.error(
        `ERROR (patient_vitals_list_delete): ${err?.response?.data?.message}`
      )
    }
  }


  const handlePatientVitalsDetail = async (e, id, idx) => {
    console.log("patient vital details", id, idx);
    navigate(`/patient_vitals/${id}^${idx}`);
  };


  const handlePatientVitalsUpdate = async (id) => {
    console.log("patient vitals update", id);
    navigate(`/patient_vitals/update/${id}`);
  };
  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <SortableTable
            tableHead={TABLE_HEAD}
            title="Patient Vital List"
            data={patientVitals}
            detail="See information about all OPDs."
            // text="Add Prescription"
            // addLink="/prescription/add"
            handleDelete={handlePatientVitalsDelete}
            justDeleteRecord={true}
            searchKey="opd"
            handleDetail={handlePatientVitalsDetail}
            detailsFlag={true}
            handleUpdate={handlePatientVitalsUpdate}
            defaultSortOrder="date"
          />
        </Layout>
      )}
    </>
  );
}
