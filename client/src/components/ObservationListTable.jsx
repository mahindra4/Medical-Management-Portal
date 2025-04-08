import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'sonner';
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import { SortableTable } from "./SortableTable";
import Layout from "../layouts/PageLayout";

const TABLE_HEAD = {
  id: "#",
  patientName: "Patient Name",
  doctorName: "Doctor",
  spO2: "SpO2 (%)",
  temperature: "Temp (°C)",
  bloodPressure: "BP (mmHg)",
  pulseRate: "PR (bpm)",
  date: "Date",
  diagnosis: "Diagnosis",
  symptoms: "Symptoms",
  medicineDetails: "Medicines (Dosage/Freq)",
  totalQuantity: "Total Qty",
  status: "Status",
  action: "Action"
};

const fetchObservations = async () => {
  try {
    const response = await axios.get(apiRoutes.observation, {
      withCredentials: true
    });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch observations:', error);
    throw error;
  }
};

export default function ObservationListTable() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [observations, setObservations] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchObservations();
        setObservations(data);
        toast.success('Observation list loaded successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load observations');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${apiRoutes.observation}/${id}`, {
        withCredentials: true
      });
      
      if (response.data.ok) {
        toast.success(response.data.message);
        setObservations(prev => prev.filter(obs => obs.id !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete observation');
    }
  };

  const handleViewDetails = (rowData, index) => {
    // Extract the ID properly from the row data
    const observationId = rowData?.id || rowData?.originalId;
    if (!observationId) {
      console.error('No observation ID found in row:', rowData);
      toast.error('Could not determine observation ID');
      return;
    }
    navigate(`/observation/${observationId}^${index}`);
  };

  const handleEdit = (rowData) => {
    // Extract the ID properly from the row data
    const observationId = rowData?.id || rowData?.originalId;
    if (!observationId) {
      console.error('No observation ID found in row:', rowData);
      toast.error('Could not determine observation ID');
      return;
    }
    navigate(`/observation/update/${observationId}`);
  };

  if (loading) return <SyncLoadingScreen />;

  return (
    <Layout>
      <SortableTable
        tableHead={TABLE_HEAD}
        title="Patients Under Observation"
        data={observations}
        detail="View and manage all patients under medical observation"
        text="Add New Observation"
        addLink="/prescription/add"
        handleDelete={handleDelete}
        searchKey="patientName"
        handleDetail={handleViewDetails}
        detailsFlag={true}
        handleUpdate={handleEdit}
        defaultSortOrder="date"
        deleteDisabled={(row) => row.status === "Active"}
        deleteTooltip={(row) => 
          row.status === "Active" 
            ? "Active observations cannot be deleted" 
            : "Delete this observation record"
        }
      />
    </Layout>
  );
}