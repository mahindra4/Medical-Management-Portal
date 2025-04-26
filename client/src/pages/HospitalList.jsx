import { SortableTable } from "../components/SortableTable";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import {
  SyncLoadingScreen,
} from "../components/UI/LoadingScreen";
import Layout from "../layouts/PageLayout";
import { apiRoutes } from "../utils/apiRoutes";

const TABLE_HEAD = {
  id: "#",
  name: "Hospital Name",
  action: "Action",
};

const getHospitalsData = async () => {
  try {
    const response = await axios.get(apiRoutes.hospitals, {
      withCredentials: true
    });
    console.log(response.data.data);
    toast.success('Hospital List fetched successfully')
    return response.data.data;
  } catch (error) {
    console.error(`ERROR (get-hospital-list): ${error?.response?.data?.message}`);
    toast.error('Failed to fetch Hospital List')
    return [];
  }
}

export default function HospitalList() {
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalList = async () => {
      const data = await getHospitalsData();
      setHospitals(data);
      setLoading(false);
    };
    fetchHospitalList();
  }, []);

  const handleHospitalUpdate = (id) => {
    console.log("id : ", id);
    if (id) navigate(`/hospital/update/${id}`);
  };

  const handleHospitalDelete = async (e, id) => {
    try {
      const res = await axios.delete(`${apiRoutes.hospitals}/${id}`, {
        withCredentials: true
      });
      console.log(res);
      if (res) {
        const data = res?.data;
        if (data && data.ok) {
          console.log("backend message : ", data.message);
          toast.success(data?.message);
          setHospitals((prev) => prev.filter(h => h.id !== id));
        } else {
          console.log(`ERROR (get-hospital-list): ${data?.message || "NO DATA"}`);
        }
      }
    } catch (err) {
      console.error(`ERROR (delete-hospital): ${err?.response?.data?.message}`);
      toast.error(err?.response?.data?.message || 'Failed to delete Hospital');
    }
  };

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <SortableTable
            tableHead={TABLE_HEAD}
            title="Hospital List"
            data={hospitals}
            detail="See information about all hospitals."
            text="Add Hospital"
            addLink="/hospital/add"
            handleDelete={handleHospitalDelete}
            searchKey="name"
            handleUpdate={handleHospitalUpdate}
          />
        </Layout>
      )}
    </>
  );
}
