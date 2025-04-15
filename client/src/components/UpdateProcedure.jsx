import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Select from "react-select";

export default function UpdateProcedure() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get procedure ID from URL
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [hosptialList, setHospitalList] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState({});
    const [formData, setFormData] = useState({
        opdNumber: "",
        patientEmail: "",
        patientName: "",
        inTime: "",
        procedureRecord: "",
        patientConditionBefore: "",
        referredHospital: "",
        outTime: "",
    });

    // Fetch procedure data, patients, and hospitals when component mounts
    useEffect(() => {
        const fetchProcedure = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${apiRoutes.Procedure}/${id}`, {
                    withCredentials: true,
                });
                const procedureData = response.data;
                setFormData({
                    opdNumber: procedureData.id || "",
                    patientEmail: procedureData.patientEmail || "",
                    patientName: procedureData.patientName || "",
                    inTime: procedureData.inTime ? new Date(procedureData.inTime).toISOString().slice(0, 16) : "",
                    procedureRecord: procedureData.procedureRecord || "",
                    patientConditionBefore: procedureData.patientConditionBefore || "",
                    referredHospital: procedureData.referredHospital || "",
                    outTime: procedureData.outTime ? new Date(procedureData.outTime).toISOString().slice(0, 16) : "",
                });
                
                // If hospital is set, prepare the selectedHospital state
                if (procedureData.referredHospital) {
                    setSelectedHospital({
                        value: procedureData.referredHospital,
                        label: procedureData.referredHospital
                    });
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching procedure:", error);
                toast.error("Failed to fetch procedure details.");
                setLoading(false);
                navigate("/procedure"); // Redirect back to list on error
            }
        };
        
        const fetchPatients = async () => {
            try {
                const response = await axios.get(apiRoutes.patient, {
                    withCredentials: true,
                });
                
                // Format patients for select dropdown
                const formattedPatients = response.data.data.map(patient => ({
                    value: patient,
                    label: patient.email
                }));
                
                setPatients(formattedPatients);
                
                // Set selected patient based on procedure data
                if (formData.patientEmail) {
                    const matchingPatient = formattedPatients.find(
                        patient => patient.value.email === formData.patientEmail
                    );
                    
                    if (matchingPatient) {
                        setSelectedPatient(matchingPatient);
                    }
                }
            } catch (error) {
                console.error("Error fetching patients:", error);
                toast.error("Failed to fetch patients list.");
            }
        };
        
        const fetchHospitals = async () => {
            try {
                const response = await axios.get(apiRoutes.hospitals, {
                    withCredentials: true
                });
                setHospitalList(response.data.data);
            } catch (error) {
                console.error(`Error in fetching Hospital List: ${error?.response?.data?.message}`);
                toast.error(
                    error?.response?.data?.message || "Failed to fetch Hospital list"
                );
            }
        };
        
        fetchProcedure();
        fetchHospitals();
        
        // Only fetch patients after procedure data is loaded
        if (formData.patientEmail) {
            fetchPatients();
        }
    }, [id, formData.patientEmail]);

    // Additional effect to set selected patient once both procedure and patients are loaded
    useEffect(() => {
        if (patients.length > 0 && formData.patientEmail) {
            const matchingPatient = patients.find(
                patient => patient.value.email === formData.patientEmail
            );
            
            if (matchingPatient) {
                setSelectedPatient(matchingPatient);
            }
        }
    }, [patients, formData.patientEmail]);

    const handlePatientChange = (selectedOption) => {
        setSelectedPatient(selectedOption);
        
        if (selectedOption) {
            setFormData(prevData => ({
                ...prevData,
                patientEmail: selectedOption.value.email,
                patientName: selectedOption.value.name
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                patientEmail: "",
                patientName: ""
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            id: formData.opdNumber,
            patientEmail: formData.patientEmail,     
            patientName: formData.patientName,
            inTime: formData.inTime,
            procedureRecord: formData.procedureRecord,
            patientConditionBefore: formData.patientConditionBefore,
            referredHospital: formData.referredHospital,
            outTime: formData.outTime
        };
        
        try {
            const response = await axios.put(`${apiRoutes.Procedure}/${id}`, data, {
                withCredentials: true
            });
            toast.success("Procedure record updated successfully!");
            navigate("/procedure");
        } catch (error) {
            console.error("Error updating procedure record:", error);
            toast.error("Failed to update procedure record.");
        }
        setLoading(false);
    };

    const handleHospitalChange = (selectedOption) => {
        setSelectedHospital(selectedOption || {});
    
        const referredHospital = (selectedOption) ? selectedOption.value : "";
        setFormData((prevData) => ({
            ...prevData,
            referredHospital,
        }));
    };

    return (
        <>
            {loading && <SyncLoadingScreen />}
            {!loading && (
                <Layout>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h1 className="text-2xl font-sans font-bold">Update Procedure</h1>
                                <p className="text-gray-600">Edit existing procedure record.</p>
                            </div>
                            <button 
                                onClick={() => navigate("/procedure")} 
                                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
                            >
                                PROCEDURE LIST
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block mb-2">
                                        OPD Number <span className="text-red-500">*</span>:
                                    </label>
                                    <input
                                        type="text"
                                        name="opdNumber"
                                        placeholder="OPD Number"
                                        value={formData.opdNumber}
                                        onChange={handleChange}
                                        required
                                        readOnly // Make OPD Number read-only for updates
                                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        Patient Email <span className="text-red-500">*</span>:
                                    </label>
                                    <Select
                                        options={patients}
                                        name="patientEmail"
                                        placeholder="Select Patient"
                                        className="w-full"
                                        value={selectedPatient}
                                        onChange={handlePatientChange}
                                        isClearable={true}
                                        isSearchable={true}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        Patient Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="patientName"
                                        placeholder="Patient Name"
                                        value={formData.patientName}
                                        readOnly
                                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        In Time <span className="text-red-500">*</span>:
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="inTime"
                                        value={formData.inTime}
                                        onChange={handleChange}
                                        required
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block mb-2">
                                        Procedure Record <span className="text-red-500">*</span>:
                                    </label>
                                    <textarea
                                        name="procedureRecord"
                                        placeholder="Enter procedure details"
                                        value={formData.procedureRecord}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block mb-2">
                                        Patient Condition Before <span className="text-red-500">*</span>:
                                    </label>
                                    <textarea
                                        name="patientConditionBefore"
                                        placeholder="Describe patient's condition before procedure"
                                        value={formData.patientConditionBefore}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        Referred Hospital:
                                    </label>
                                    <Select
                                        id="referredHospital"
                                        options={hosptialList.map((hospital) => ({
                                            value: hospital,
                                            label: hospital
                                        }))}
                                        name="referredHospital"
                                        placeholder="Select Hospital"
                                        className="w-full"
                                        value={selectedHospital.value ? selectedHospital : null}
                                        onChange={handleHospitalChange}
                                        isClearable={true}
                                        isSearchable={true}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block mb-2">
                                        Out Time:
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="outTime"
                                        value={formData.outTime}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-4">
                                <button 
                                    type="button"
                                    onClick={() => navigate("/procedure")}
                                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition"
                                >
                                    CANCEL
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
                                >
                                    UPDATE
                                </button>
                            </div>
                        </form>
                    </div>
                </Layout>
            )}
        </>
    );
}
