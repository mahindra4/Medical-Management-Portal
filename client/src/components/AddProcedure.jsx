import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Select from "react-select";

export function AddProcedure() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [hosptialList, setHospitalList] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState({});
    const [getpatientdetails, setGetPatientDetails] = useState([]);
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

    // Fetch patients, hospitals, and generate OPD number when component mounts
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                const response = await axios.get(apiRoutes.patient, {
                    withCredentials: true,
                });
                
                // Format patients for select dropdown
                const formattedPatients = response.data.data.map(patient => ({
                    value: patient,
                    label: patient.email
                }));
                
                setPatients(formattedPatients);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching patients:", error);
                toast.error("Failed to fetch patients list.");
                setLoading(false);
            }
        };
        
        const fetchHospitals = async () => {
            try {
                const response = await axios.get(apiRoutes.hospitals, {
                    withCredentials: true
                });
                console.log("Hospital List: ", response.data.data);
                const hospitalData=response.data.data.map((item)=>{
                    return item.name;
                })
                setHospitalList(hospitalData);
            } catch (error) {
                console.error(`Error in fetching Hospital List: ${error?.response?.data?.message}`);
                toast.error(
                    error?.response?.data?.message || "Failed to fetch Hospital list"
                );
            }
        };
        
        const generateOPDNumber = async () => {
            try {
                const today = new Date();
                const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
                
                // Fetch today's procedures to determine next increment number
                const response = await axios.get(apiRoutes.Procedure, {
                    withCredentials: true
                });
                
                const todaysProcedures = response.data.filter(proc => {
                    if (!proc.id) return false;
                    // Check if the procedure ID starts with today's formatted date
                    return proc.id.startsWith(formattedDate);
                });
                
                // Find the highest increment number for today
                let maxIncrement = 0;
                todaysProcedures.forEach(proc => {
                    const parts = proc.id.split('-');
                    if (parts.length === 2) {
                        const increment = parseInt(parts[1], 10);
                        if (!isNaN(increment) && increment > maxIncrement) {
                            maxIncrement = increment;
                        }
                    }
                });
                
                // Generate new OPD number with next increment
                const nextIncrement = maxIncrement + 1;
                const opdNumber = `${formattedDate}-${nextIncrement}`;
                
                setFormData(prev => ({
                    ...prev,
                    opdNumber
                }));
            } catch (error) {
                console.error("Error generating OPD number:", error);
                toast.error("Failed to generate OPD number.");
            }
        };
        
        fetchPatients();
        fetchHospitals();
        generateOPDNumber();
    }, []);

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
        if (name === "inTime") {
            const selected = new Date(value);
            const now = new Date();
    
            // Normalize both times to minute-level precision
            selected.setSeconds(0, 0);
            now.setSeconds(0, 0);
    
            if (selected.getTime() !== now.getTime()) {
                toast.error("In Time must match the current time.");
                return; // Don't update formData
            }
        }
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
        
        console.log(data);
        
        try {
            const response = await axios.post(apiRoutes.Procedure, data, {
                withCredentials: true
            });
            toast.success("Procedure record saved successfully!");
            
            // Reset form after successful submission
            const today = new Date();
            const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear().toString().slice(-2)}`;
            
            // Get the current increment and add 1 for the next form
            const currentIncrement = parseInt(formData.opdNumber.split('-')[1], 10);
            const nextOpdNumber = `${formattedDate}-${currentIncrement + 1}`;
            
            setFormData({
                opdNumber: nextOpdNumber,
                patientEmail: "",
                patientName: "",
                inTime: "",
                procedureRecord: "",
                patientConditionBefore: "",
                referredHospital: "",
                outTime: "",
            });
           
            setSelectedPatient(null);
            navigate("/procedure");
        } catch (error) {
            console.error("Error saving procedure record:", error);
            toast.error("Failed to save procedure record.");
        }
        setLoading(false);
    };

    const handleHospitalChange = (selectedOption) => {
        console.log("selected hospital: ", selectedOption); 
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
                                <h1 className="text-2xl font-sans font-bold">Procedure Form</h1>
                                <p className="text-gray-600">Add a new procedure record.</p>
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
                                        OPD Number:
                                    </label>
                                    <input
                                        type="text"
                                        name="opdNumber"
                                        value={formData.opdNumber}
                                        readOnly
                                        className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Auto-generated OPD number</p>
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
                            
                            <div className="flex justify-end">
                                <button 
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
                                >
                                    SAVE
                                </button>
                            </div>
                        </form>
                    </div>
                </Layout>
            )}
        </>
    );
}
