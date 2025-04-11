import { SortableTable } from "../components/SortableTable";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import Layout from "../layouts/PageLayout";

const TABLE_HEAD = {
  id: "#",
  patientName: "Patient Name",
  doctorName: "Doctor",
  staffName: "ParaMedical Staff",
  date: "Date",
  time: "Time",
  diagnosis: "Diagnosis",
  symptoms: "Symptoms",
  action: "Action",
};

// Fetch all prescriptions
const getPrescriptionData = async () => {
  try {
    const response = await axios.get(apiRoutes.checkup, {
      withCredentials: true,
    });
    console.log("response", response.data.data);
    toast.success("Prescription List fetched successfully");
    return response.data.data;
  } catch (error) {
    console.error(`ERROR (get-prescription-list): ${error?.response?.data?.message}`);
    toast.error("Failed to fetch Prescription List");
    return [];
  }
};

export default function PrescriptionList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prescription, setPrescription] = useState([]);
  const [filteredPrescription, setFilteredPrescription] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getPrescriptionData();
      setPrescription(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();

    let date = toDate;
    if (!fromDate) {
      setFilteredPrescription(prescription);
      return;
    }

    if (!toDate) {
      date = today;
    }

    const filteredData = prescription
      .filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(fromDate) && itemDate <= new Date(date);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setFilteredPrescription(filteredData);
  }, [fromDate, toDate, prescription]);

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
          console.log(`ERROR (prescription_list_delete): ${data.message}`);
          toast.error(
            "Failed to delete prescription"
          );
        }
      } catch (err) {
        console.error(
          `ERROR (prescription_list_delete): ${err?.response?.data?.message}`
        );
      }
    };
    const handlePrescriptionDetail = async (e, id, idx) => {
      console.log("Prescription Detail", id, idx);
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
        <div>
          <Layout>
            <p className="mb-4 ml-1 text-gray-700"> sort by date</p>
            {/* Date Filters */}
            <div className="filter-container flex gap-4 mb-4">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded-md"
                placeholder="From Date"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded-md"
                placeholder="To Date"
              />
            </div>

            {/* Prescription Table */}
            {/* <SortableTable
              tableHead={TABLE_HEAD}
              title="Prescription List"
              data={filteredPrescription}  // Use filtered & sorted data
              detail="See information about all OPDs."
              text="Add Prescription"
              addLink="/prescription/add"
              searchKey="patientName"
              defaultSortOrder="date"
            /> */}

            <SortableTable
                tableHead={TABLE_HEAD}
                title="Prescription List"
                data={filteredPrescription}
                searchKey="patientName"
                detail="See information about all OPDs."
                addLink="/prescription/add"
                handleDelete={handlePrescriptionDelete}
                handleDetail={handlePrescriptionDetail}
                handleUpdate={handlePrescriptionUpdate}
                detailsFlag={true}
                defaultSortOrder="date"
              />
          </Layout>
        </div>
      )}
    </>
  );
}
