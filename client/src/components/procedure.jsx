import { SortableTable } from "./SortableTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'sonner';
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Layout from "../layouts/PageLayout";

const TABLE_HEAD = {
    id: "#",
    opd: "OPD",
    patientName: "Patient Name",
    patientEmail: "Email",
    inTime: "In Time",
    outTime: "Out Time",
    referredHospital: "Referred Hospital",
    procedureRecord: "Procedure",
    action: "Action"
};

const getProceduresData = async () => {
  try {
    console.log(apiRoutes.Procedure);
    const response = await axios.get(apiRoutes.Procedure, {
      withCredentials: true
    });
    console.log("response", response.data);
    toast.success('Procedures fetched successfully');
    return response.data;
  } catch (error) {
    console.error(`ERROR (get-procedures): ${error?.response?.data?.message}`);
    toast.error('Failed to fetch Procedures');
    return [];
  }
};

export function ProcedureTable() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [procedures, setProcedures] = useState([]);
  
    // Move fetchData outside useEffect so it can be reused
    const fetchData = async () => {
      setLoading(true);
      const data = await getProceduresData();
      console.log("Procedures data:", data);
      setProcedures(data);
      console.log("Procedures state:", procedures);
      setLoading(false);
    };
  
    useEffect(() => {
      fetchData();
    }, []);
  
    const handleProcedureDelete = async (e, id) => {
        try {
          const res = await axios.delete(`${apiRoutes.Procedure}/${id}`, {
            withCredentials: true
          });
          
          const { data } = res;
          console.log("Delete response:", data);
          
          if (data?.message?.includes('successfully')) {
            console.log(`MESSAGE: ${data?.message}`);
            toast.success(data?.message || "Procedure deleted successfully");
            console.log("Deleted ID:", id);
            
            // Just update the state by filtering out the deleted procedure
            setProcedures(prevProcedures => prevProcedures.filter(procedure => procedure.id !== id));
          } else {
            console.log(`ERROR (procedure_delete): ${data?.message}`);
            toast.error(data?.message || "Failed to delete procedure");
          }
        } catch (err) {
          console.error(`ERROR (procedure_delete): ${err?.response?.data?.message}`);
          toast.error(err?.response?.data?.message || "Failed to delete procedure");
        }
      };

    const handleProcedureDetail = async (e, id, idx) => {
      console.log("Procedure Detail", id);
      navigate(`/procedure/${id}`);
    };
  
    const handleProcedureUpdate = async (id) => {
      console.log("Procedure Edit", id);
      navigate(`/procedure/update/${id}`);
    };
  
    return (
      <>
        {loading && <SyncLoadingScreen />}
        {!loading && (
          <Layout>
            <SortableTable
              tableHead={TABLE_HEAD}
              title="Procedure List"
              data={procedures}
              detail="See information about all procedures."
              text="Add Procedure"
              addLink="/procedure/add"
              handleDelete={handleProcedureDelete}
              searchKey="patientName"
              handleDetail={handleProcedureDetail}
              detailsFlag={true}
              handleUpdate={handleProcedureUpdate}
              defaultSortOrder="inTime"
            />
          </Layout>
        )}
      </>
    );
  }

export default ProcedureTable;
