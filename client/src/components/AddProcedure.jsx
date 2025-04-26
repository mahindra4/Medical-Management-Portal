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
    const [hospitals, setHospitals] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);

    const [formData, setFormData] = useState({
        opdNumber: "",
        patientEmail: "",
        patientName: "",
        inTime: "",
        outTime: "",
        referredHospital: "",
        procedureRecord: "",
        patientConditionBefore: "",
    });

    useEffect(() => {
        async function fetchInitialData() {
            try {
                setLoading(true);

                const [patientRes, hospitalRes, procedureRes] = await Promise.all([
                    axios.get(apiRoutes.patient, { withCredentials: true }),
                    axios.get(apiRoutes.hospitals, { withCredentials: true }),
                    axios.get(apiRoutes.Procedure, { withCredentials: true }),
                ]);

                const formattedPatients = patientRes.data.data.map((p) => ({
                    label: p.email,
                    value: p,
                }));
                setPatients(formattedPatients);

                const formattedHospitals = hospitalRes.data.data.map((h) => ({
                    label: h.name,
                    value: h.name,
                }));
                setHospitals(formattedHospitals);

                const today = new Date();
                const datePrefix = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear().toString().slice(-2)}`;

                const todayProcedures = procedureRes.data.filter((p) => p.id?.startsWith(datePrefix));
                const nextIncrement = todayProcedures.length + 1;

                const opdNumber = `${datePrefix}-${nextIncrement}`;

                const now = new Date().toISOString().slice(0, 16);
                setFormData((prev) => ({
                    ...prev,
                    opdNumber,
                    inTime: now,
                }));

            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch initial data.");
            } finally {
                setLoading(false);
            }
        }

        fetchInitialData();
    }, []);

    const handlePatientChange = (selected) => {
        setSelectedPatient(selected);
        if (selected) {
            setFormData((prev) => ({
                ...prev,
                patientEmail: selected.value.email,
                patientName: selected.value.name,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                patientEmail: "",
                patientName: "",
            }));
        }
    };

    const handleHospitalChange = (selected) => {
        setSelectedHospital(selected);
        setFormData((prev) => ({
            ...prev,
            referredHospital: selected ? selected.value : "",
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "outTime") {
            const now = new Date();
            const inTime = new Date(formData.inTime);
            const outTime = new Date(value);

            if (outTime < inTime) {
                toast.error("Out Time cannot be before In Time.");
                return;
            }
            if (outTime > now) {
                toast.error("Out Time cannot be from the future.");
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const now = new Date();
            if (new Date(formData.inTime) > now || (formData.outTime && new Date(formData.outTime) > now)) {
                toast.error("In Time / Out Time cannot be from the future.");
                return;
            }

            await axios.post(apiRoutes.Procedure, {
                id: formData.opdNumber,
                ...formData,
            }, {
                withCredentials: true,
            });

            toast.success("Procedure record saved successfully!");
            navigate("/procedure");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save procedure.");
        }
    };

    return (
        <>
            {loading && <SyncLoadingScreen />}
            {!loading && (
                <Layout>
                    <div className="p-6">
                        <div className="flex justify-between mb-6">
                            <h1 className="text-2xl font-bold">Procedure Details</h1>
                            <div className="flex gap-2">
                                <button onClick={() => navigate("/procedure")} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-700">PROCEDURE LIST</button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div>
                                <label className="block mb-1">OPD Number:</label>
                                <input
                                    type="text"
                                    name="opdNumber"
                                    value={formData.opdNumber}
                                    readOnly
                                    className="w-full p-2 border rounded bg-gray-100"
                                />
                            </div>

                            <div></div> {/* Empty to maintain alignment */}

                            <div>
                                <label className="block mb-1">Patient Email <span className="text-red-500">*</span>:</label>
                                <Select
                                    options={patients}
                                    value={selectedPatient}
                                    onChange={handlePatientChange}
                                    isClearable
                                    placeholder="Select Patient"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Patient Name <span className="text-red-500">*</span>:</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
                                    readOnly
                                    placeholder="Patient Name"
                                    className="w-full p-2 border rounded bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">In Time <span className="text-red-500">*</span>:</label>
                                <input
                                    type="datetime-local"
                                    name="inTime"
                                    value={formData.inTime}
                                    readOnly
                                    className="w-full p-2 border rounded bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block mb-1">Procedure Record <span className="text-red-500">*</span>:</label>
                                <textarea
                                    name="procedureRecord"
                                    value={formData.procedureRecord}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter procedure details"
                                    rows="4"
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-1">Patient Condition Before <span className="text-red-500">*</span>:</label>
                                <textarea
                                    name="patientConditionBefore"
                                    value={formData.patientConditionBefore}
                                    onChange={handleChange}
                                    required
                                    placeholder="Describe patient's condition before procedure"
                                    rows="4"
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-1">Referred Hospital:</label>
                                <Select
                                    options={hospitals}
                                    value={selectedHospital}
                                    onChange={handleHospitalChange}
                                    isClearable
                                    placeholder="Select Hospital"
                                    className="w-full"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block mb-1">Out Time:</label>
                                <input
                                    type="datetime-local"
                                    name="outTime"
                                    value={formData.outTime}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="md:col-span-2 flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
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
