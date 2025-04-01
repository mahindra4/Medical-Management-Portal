import React, { useState, useEffect } from "react";
import Select from "react-select";
import { TrashIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import {
  CardBody,
  Card,
  Input,
  CardHeader,
  Typography,
  Button,
  CardFooter,
  Select as MaterialSelect,
  Option,
  Tooltip,
  IconButton,
  Textarea,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { useAuthContext } from "../hooks/useAuthContext";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import { use } from "react";

export default function AddPrescriptionForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { userEmail } = useAuthContext();
  const [formData, setFormData] = useState({
    email: "",
    doctor: "",
    date: "",
    temperature: "",
    bloodPressure: "",
    name: "",
    pulseRate: "",
    spO2: "",
    symptoms: "",
    diagnosis: "",
    referredHospital: "",
    referredDoctor: ""
  });

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [diagnosisList, setDiagnosisList] = useState([]);
  const [diagnosisSymptomsList, setDiagnosisSymptomsList] = useState({});
  const [selectedDiagnosis, setSelectedDiagnosis] = useState([]);
  const [symptom, setSymptom] = useState("")
  const [hosptialList, setHospitalList] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState({});

  const TABLE_HEAD = [
    "Medicine Name",
    "Dosage",
    "Quantity",
    "Avl. Qty",
    "Action",
  ];
  const [dataArray, setDataArray] = useState([
    { name: "", dosage: "", quantity: "" },
  ]);

  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");

  const FORM_STORAGE_KEY = "prescriptionFormData";
  const HANDLE_INPUT_CHANGE_KEY = "handleInputChange";
  const HANDLE_SELECTED_MEDICINE = "handleSelectedMedicine";
  const HANDLE_PATIENT_EMAIL = "handlePatientEmail";
  const HANDLE_DOCTOR_EMAIL = "handleDoctorEmail";
  const HANDLE_DIAGNOSIS_CHANGE = "handleDiagnosisChange";
  const HANDLE_DIAGNOSIS_VALUE_CHANGE = "handleDiagnosisValueChange";
  const HANDLE_SYMPTOM_CHANGE = "handleSymptomChange";
  const HANDLE_HOSPITAL_CHANGE = "handleHospitalChange";

  useEffect(
    () => async () => {
      // Fetch doctors list when the component mounts
      // fetchDoctors();
      setLoading(true);
      await fetchAvailableStock();
      await fetchDoctors();
      await fetchPatients();
      await fetchDiagnosisList();
      await fetchDiagnosisSymptomsList();
      await fetchHospitalList();

      const form_data = sessionStorage.getItem(FORM_STORAGE_KEY);
      const patient_email = sessionStorage.getItem(HANDLE_PATIENT_EMAIL);
      const doctor_email = sessionStorage.getItem(HANDLE_DOCTOR_EMAIL);
      const diagnosis = sessionStorage.getItem(HANDLE_DIAGNOSIS_CHANGE);
      const diagnosisVal = sessionStorage.getItem(HANDLE_DIAGNOSIS_VALUE_CHANGE);
      const symptom = sessionStorage.getItem(HANDLE_SYMPTOM_CHANGE);
      const hospital = sessionStorage.getItem(HANDLE_HOSPITAL_CHANGE);

      // console.log("initial---------------------------")
      // console.log("form_data: ", form_data);
      // console.log("patient_email: ",patient_email);
      // console.log("doctor_email: ", doctor_email);
      // console.log("diagnosis: ", diagnosis);
      // console.log("diagnosisVal: ", diagnosisVal);
      // console.log("symptom: ", symptom);

      setFormData((prevData) => ({
        ...prevData,
        date: new Date().toISOString().split('T')[0],
      }))

      if(form_data != null){
        setFormData(JSON.parse(form_data))
      }
      if(patient_email != null){
        setSelectedPatient(JSON.parse(patient_email))
      }

      if(doctor_email != null){
        setSelectedDoctor(JSON.parse(doctor_email))
      }

      if(diagnosis != null){
        setSelectedDiagnosis(JSON.parse(diagnosis))
        setFormData((prevData) => ({
          ...prevData,
          diagnosis: diagnosisVal
        }))
      }

      if(symptom != null){
        setFormData((prevData) => ({
          ...prevData,
          symptoms: symptom,
        }))
      }

      if(hospital != null){
        setSelectedHospital(JSON.parse(hospital));
      }

      // console.log("formData: ", formData);
      // if(savedData){
      //   setFormData(JSON.parse(savedData)) 
      //   console.log(JSON.parse(savedData))
      // }

      const medical_data = sessionStorage.getItem(HANDLE_INPUT_CHANGE_KEY)
      if(medical_data != null){
        setDataArray(JSON.parse(medical_data))
      }

      // const medicine_data = sessionStorage.getItem(HANDLE_SELECTED_MEDICINE)
      // if(medicine_data){
      //   // console.log(JSON.parse(medicine_data))
      //   setDataArray(JSON.parse(medicine_data))
      // } 

      // formData.date = // default date => today

      // console.log("formData: ", formData);
      // console.log("formData symptoms: ", formData.symptoms);
      setLoading(false);
    },
    []
  );

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(apiRoutes.staff, {
        withCredentials: true,
      });
      response.data.data = response.data.data.filter(
        (staff) => staff.role === "DOCTOR"
      );
      const doctorList = response.data.data;
      setDoctors(doctorList);
    } catch (error) {
      console.error(
        `ERROR (fetch-doctors-in-add-prescription): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Doctors List"
      );
    }
  };
  const fetchPatients = async () => {
    try {
      const response = await axios.get(apiRoutes.patient, {
        withCredentials: true,
      });
      setPatients(response.data.data);
    } catch (error) {
      console.error(
        `ERROR (fetch-patients-in-add-prescription): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Patients List"
      );
    }
  };

  const fetchAvailableStock = async () => {
    try {
      const response = await axios.get(apiRoutes.stock + "/available", {
        withCredentials: true,
      });
      console.log(response.data.data);
      setMedicines(response.data.data); // Assuming the response is an array of medicines
    } catch (error) {
      console.error(
        `ERROR (fetch-medicines-in-add-purchase): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to fetch Medicines"
      );
    }
  };

  const fetchDiagnosisList = async () => {
    try{
      const response = await axios.get(apiRoutes.diagnosis, {
        withCredentials: true,
      })
      // console.log(response.data.data);
      setDiagnosisList(response.data.data);
      console.log('diagnosis data')
      console.log(response.data.data)
      // console.log(diagnosisList)
    } catch(err){
      console.error(`Error in fetching Diagnosis List: ${err?.response.data?.message}`)
      toast.error(
        error?.response?.data?.message || "Failed to fetch Diagnosis list"
      )
    }
  };

  const fetchDiagnosisSymptomsList = async () => {
    try{
      const response = await axios.get(`${apiRoutes.diagnosis}/symptoms`,{
        withCredentials: true
      })
      console.log(`${apiRoutes.diagnosis}/symptoms`)
      console.log(response.data.data)
      setDiagnosisSymptomsList(response.data.data)

    } catch(err){
      console.error(`Error in fetching Diagnosis Symptoms List: ${err?.response.data?.message}`)
      toast.error(
        error?.response?.data?.message || "Failed to fetch Diagnosis list"
      )
    }
  }

  const fetchHospitalList = async () => {
    try{
      const response = await axios.get(apiRoutes.hospitals, {
        withCredentials: true
      });
      setHospitalList(response.data.data);
    } catch(err){
      console.error(`Error in fetching Hospital List: ${err?.response.data?.message}`);
      toast.error(
        error?.response?.data?.message || "Failed to Hospital list"
      )
    }
  }

  const handleInputChange = (key, index, value) => {
    // console.log(dataArray)
    console.log('handle Input Change')
    console.log(`key: ${key}`);
    console.log(`index: ${index}`);
    console.log(`value: ${value}`);
    const updatedArray = [...dataArray];
    console.log(updatedArray);
    updatedArray[index][key] = value;
    setDataArray(updatedArray);
    console.log(updatedArray)

    sessionStorage.setItem(HANDLE_INPUT_CHANGE_KEY,JSON.stringify(updatedArray))

  };

  const handleDoctorChange = (selectedDoctor) => {
    console.log('handle Doctor Change')
    console.log(selectedDoctor);
    setSelectedDoctor(selectedDoctor);

    const doctorVal = selectedDoctor ? selectedDoctor.value : ""
    setFormData((prevData) => ({
      ...prevData,
      doctor: doctorVal,
    }));
    sessionStorage.setItem(HANDLE_DOCTOR_EMAIL,JSON.stringify(selectedDoctor))
  };

  const handleDiagnosisChange = (selectedDiagnosis) => {
    console.log("selected diagnosis: ",selectedDiagnosis)
    setSelectedDiagnosis(selectedDiagnosis);

    sessionStorage.setItem(HANDLE_DIAGNOSIS_CHANGE,JSON.stringify(selectedDiagnosis))
    var diagnosisVal = "";
    var symptomsVal = "";

    // if(selectedDiagnosis){
      for(let diagnosis of selectedDiagnosis){
        if(diagnosisVal === ""){
          diagnosisVal = diagnosis.value;
        }
        else{
          diagnosisVal = diagnosisVal+", "+diagnosis.value;
        }
        const symptomsList = diagnosisSymptomsList[diagnosis.value].join(", ");
        if(symptomsVal === ""){
          symptomsVal = symptomsList;
        }
        else{
          symptomsVal = symptomsVal+", "+symptomsList
        }
      }
      // symptomsVal = symptomsList.join(", ");
    // }
    sessionStorage.setItem(HANDLE_DIAGNOSIS_VALUE_CHANGE,diagnosisVal)
    sessionStorage.setItem(HANDLE_SYMPTOM_CHANGE,symptomsVal)

    console.log(`diagnosisval: ${diagnosisVal}`);
    console.log(formData.date)
    setFormData((prevData) => ({
      ...prevData,
      diagnosis: diagnosisVal,
      symptoms: symptomsVal,
    }))

    console.log(formData)
    // add it in the session storage for draft feature and update it in the useEffect
  }

  const handleHospitalChange = (selectedHospital) => {
    console.log("selected hospital: ",selectedHospital); 
    setSelectedHospital(selectedHospital);

    const referredHospital = (selectedHospital) ? selectedHospital.value : "";
    setFormData((prevData) => ({
      ...prevData,
      referredHospital,
    }))

    sessionStorage.setItem(HANDLE_HOSPITAL_CHANGE, JSON.stringify(selectedHospital));
  } 

  const handlePatientChange = (selectedPatient) => {
    console.log('handle Patient Change')
    console.log(selectedPatient);

    setSelectedPatient(selectedPatient);

    const patientVal = (selectedPatient) ? selectedPatient.value : "";

    setFormData((prevData) => ({
      ...prevData,
      email: patientVal,
    }));
    sessionStorage.setItem(HANDLE_PATIENT_EMAIL,JSON.stringify(selectedPatient))
  };
  const handleMedicineChange = (selectedMedicine, index) => {
    console.log('handle Medicine Change')
    console.log(selectedMedicine);
    setSelectedMedicine(selectedMedicine);

    
    // console.log('------------------------')

    setDataArray((prevData) => {
      const updatedArray = [...prevData];
      updatedArray[index].name = selectedMedicine;
      console.log(updatedArray);
      sessionStorage.setItem(HANDLE_INPUT_CHANGE_KEY,JSON.stringify(updatedArray))
      return updatedArray;
    });
  };

  const handleChange = (name, value) => {
    console.log('handle Change')
    // console.log(e.target);
    // const { name, value } = e.target;
    console.log(name, value);

    const updatedData = {
      ...formData,
      [name]: value
    }
    console.log('updatedData')
    console.log(updatedData)

    // setFormData((prevData) => ({
    //   ...prevData,
    //   [name]: value,
    // }));
    setFormData(updatedData);
    sessionStorage.setItem(FORM_STORAGE_KEY,JSON.stringify(updatedData))

  };

  const handleSave = async (e) => {
    console.log('handle save')
    e.preventDefault();
    const checkupListEntry = {
      patientId: selectedPatient?.value?.id,
      date: formData.date,
    };

    if (formData.temperature) {
      checkupListEntry.temperature = formData.temperature;
    }

    if (formData.pulseRate) {
      checkupListEntry.pulseRate = formData.pulseRate;
    }

    if (formData.spO2) {
      checkupListEntry.spO2 = formData.spO2;
    }

    if (formData.bloodPressure) {
      checkupListEntry.bloodPressure = formData.bloodPressure;
    }

    console.log("Sending data:", checkupListEntry);

    try{
      const response = await axios.post(apiRoutes.patientVitals + "/save", checkupListEntry, {
        withCredentials: true,
      });
      console.log("Save successful:", response.data);
      toast.success("Vitals saved successfully!");
    } catch(error) {
      console.error("Error saving vitals:", error.response?.data || error.message);
      toast.error(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    }

  }

  const handleSubmit = async (e) => {
    console.log('handle Submit')
    e.preventDefault();
    // Here you can handle the submission of the form
    console.log(formData.diagnosis)
    const checkupListEntry = {
      patientId: selectedPatient?.value?.id,
      date: formData.date,
      diagnosis: formData.diagnosis,
    };
    //optional fields
    if (selectedDoctor?.value) {
      checkupListEntry.doctorId = selectedDoctor?.value;
    }
    if (formData.temperature) {
      checkupListEntry.temperature = formData.temperature;
    }
    if (formData.pulseRate) {
      checkupListEntry.pulseRate = formData.pulseRate;
    }
    if (formData.spO2) {
      checkupListEntry.spO2 = formData.spO2;
    }
    if (formData.bloodPressure) {
      checkupListEntry.bloodPressure = formData.bloodPressure;
    }
    if (formData.symptoms) {
      checkupListEntry.symptoms = formData.symptoms;
    }
    if(formData.referredDoctor){
      checkupListEntry.referredDoctor = formData.referredDoctor;
    }
    if(formData.referredHospital){
      checkupListEntry.referredHospital = formData.referredHospital;
    }


    const checkupMedicines = dataArray.map((data) => {
      const medicines = {
        medicineId: data?.name?.value,
        quantity: parseInt(data.quantity) || 0,
      };
      if (data.dosage) medicines.dosage = data.dosage;
      return medicines;
    });

    const data = {
      ...checkupListEntry,
      staffEmail: userEmail,
      checkupMedicines,
    };
    console.log(data);
    setLoading(true);
    try {
      const response = await axios.post(apiRoutes.checkup, data, {
        withCredentials: true,
      });
      console.log(response.data);
      toast.success(response.data.message);

      sessionStorage.removeItem(FORM_STORAGE_KEY) 
      sessionStorage.removeItem(HANDLE_INPUT_CHANGE_KEY) 
      sessionStorage.removeItem(HANDLE_SELECTED_MEDICINE) 
      sessionStorage.removeItem(HANDLE_PATIENT_EMAIL) 
      sessionStorage.removeItem(HANDLE_DOCTOR_EMAIL) 
      sessionStorage.removeItem(HANDLE_DIAGNOSIS_CHANGE)
      sessionStorage.removeItem(HANDLE_DIAGNOSIS_VALUE_CHANGE)
      sessionStorage.removeItem(HANDLE_SYMPTOM_CHANGE)
      sessionStorage.removeItem(HANDLE_HOSPITAL_CHANGE)

      setTimeout(() => {
        navigate("/prescription");
      }, 1000);
    } catch (error) {
      console.error(
        `ERROR (add-prescription): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to add Prescription"
      );
    }
    setLoading(false);

  };

  const handleAddRow = () => {
    console.log('handle Add Row')
    setDataArray((prevData) => [
      ...prevData,
      { name: "", dosage: "", quantity: "" },
    ]);
  };

  const handleDeleteRow = (index) => {
    console.log('handle Delete Row')
    if (dataArray.length === 1) {
      toast.error("Atleast one Medicine is required in the prescription");
      return;
    }
    setDataArray((prev) => {
      const newData = [...prev];
      newData.splice(index, 1);
      return newData;
    });
  };

  return (
    <>
      {loading && <SyncLoadingScreen />}
      {!loading && (
        <Layout>
          <Card className="h-max w-full">
            <CardHeader
              floated={false}
              shadow={false}
              className="rounded-none pb-3"
            >
              <div className="mb-2 sm:flex sm:flex-row flex-col items-center justify-between gap-8">
                <div>
                  <Typography variant="h5" color="blue-gray">
                    Prescription Details
                  </Typography>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {
                      navigate("/prescription");
                    }}
                  >
                    Prescription List
                  </Button>

                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={handleSave}
                  >
                    save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
                <div className="grid md:grid-cols-2 gap-y-8 gap-x-4 w-full">
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-4 w-full md:w-72 justify-end">
                      <label htmlFor="email">
                        Patient Email <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Select
                      id="email"
                      options={patients.map((patient) => ({
                        value: patient,
                        label: patient.email,
                      }))}
                      name="email"
                      placeholder="Select Patient"
                      className="w-full"
                      value={selectedPatient}
                      onChange={handlePatientChange}
                      isClearable={true}
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end ">
                      <label htmlFor="name">
                        Patient Name <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="name"
                      size="md"
                      name="name"
                      label=""
                      className="w-full"
                      value={selectedPatient?.value?.name || ""}
                      disabled
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="temperature">Temp.(C)</label>:
                    </div>
                    <Input
                      id="temperature"
                      size="md"
                      name="temperature"
                      label="Temperature"
                      className="w-full"
                      value={formData.temperature}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="pulseRate">PR(beats/min)</label>:
                    </div>
                    <Input
                      id="pulseRate"
                      type="number"
                      min={1}
                      size="md"
                      name="pulseRate"
                      label="Pulse Rate"
                      className="w-full"
                      value={formData.pulseRate}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="pulseRate">SpO2 (%)</label>:
                    </div>
                    <Input
                      id="spO2"
                      size="md"
                      name="spO2"
                      label="SpO2"
                      className="w-full"
                      value={formData.spO2}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="bloodPressure">BP(mm Hg)</label>:
                    </div>
                    <Input
                      id="bloodPressure"
                      size="md"
                      name="bloodPressure"
                      label="Blood pressure"
                      className="w-full"
                      value={formData.bloodPressure}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">
                        Date<span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="date"
                      size="md"
                      label="Date"
                      name="date"
                      type="date"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.date}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="doctor">Doctor:</label>
                    </div>
                    <Select
                      id="doctor"
                      options={doctors.map((doctor) => ({
                        value: doctor.id,
                        label: doctor.email,
                      }))}
                      name="doctor"
                      placeholder="Select Doctor"
                      className="w-full"
                      value={selectedDoctor}
                      onChange={handleDoctorChange}
                      isClearable={true}
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">
                        Diagnosis<span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Select
                      id="diagnosis"
                      options={
                        diagnosisList.map((diagnosis) => ({
                          value: diagnosis,
                          label: diagnosis,
                        }))
                      }
                      isMulti
                      name="diagnosis"
                      placeholder="Select Diagnosis"
                      className="w-full"
                      value={selectedDiagnosis}
                      onChange={handleDiagnosisChange}
                      isClearable={true}
                    />
                    {/* <Textarea
                      id="diagnosis"
                      size="md"
                      label="Diagnosis"
                      name="diagnosis"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.diagnosis}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    /> */}
                  </div>

                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">Symptoms:</label>
                    </div>
                    <Textarea
                      id="symptoms"
                      size="md"
                      label="Symptoms"
                      name="symptoms"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.symptoms}
                      onChange={(e) =>{
                        sessionStorage.setItem(HANDLE_SYMPTOM_CHANGE,e.target.value)
                        handleChange(e.target.name, e.target.value)
                      }}
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">Referred Doctor:</label>
                    </div>
                    <Textarea
                      id="referredDoctor"
                      size="md"
                      label="Referred Doctor"
                      name="referredDoctor"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.referredDoctor}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-start justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="date">Referred Hospital:</label>
                    </div>
                    {/* <Textarea
                      id="referredHospital"
                      size="md" 
                      label="Referred Hospital"
                      name="referredHospital"
                      type="text"
                      className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                      value={formData.referredHospital}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    /> */}

                    <Select
                      id="referredHospital"
                      options={
                        hosptialList.map((hospital) => ({
                          value: hospital,
                          label: hospital
                        }))
                      }
                      name="referredHospital"
                      placeholder="Select Hospital"
                      className="w-full"
                      value={selectedHospital}
                      onChange={handleHospitalChange}
                      isClearable={true}
                    />
                  </div>
                </div>

                <div className="w-full ">
                  <table className="w-full min-w-max table-auto text-left">
                    <thead>
                      <tr>
                        {TABLE_HEAD.map((head) => (
                          <th
                            key={head}
                            className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                          >
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-normal leading-none opacity-70"
                            >
                              {head}
                              {head !== "Dosage" && head !== "Action" && (
                                <span className="text-red-800">*</span>
                              )}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dataArray.map((data, index) => (
                        <tr className="even:bg-blue-gray">
                          <td className="p-4">
                            <Select
                              id="medicine"
                              options={medicines.map((stock) => ({
                                value: stock?.medicineId,
                                netQuantity: stock?.netQuantity,
                                label: stock?.medicineName,
                              }))}
                              value={data["name"]}
                              onChange={(selectedMedicine) =>
                                handleMedicineChange(selectedMedicine, index)
                              }
                              isClearable={true}
                              placeholder="Select Medicine"
                              className="w-full"
                            />
                          </td>
                          <td className="p-4">
                            <input
                              type="text"
                              className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                              placeholder="Dosage"
                              value={data["dosage"]}
                              onChange={(e) =>
                                handleInputChange(
                                  "dosage",
                                  index,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                              <input
                                type="number"
                                min={1}
                                className="w-full border-blue-gray-200 border h-10 px-3 rounded-lg min-w-[200px]"
                                placeholder="Quantity"
                                value={data["quantity"]}
                                onChange={(e) =>
                                  handleInputChange(
                                    "quantity",
                                    index,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex-col md:flex md:flex-row items-center justify-start p-1 min-w-[200px]">
                              <Input
                                type="number"
                                min={1}
                                value={data['name']?.netQuantity || ""}
                                disabled
                              />
                            </div>
                          </td>
                          <td className="p-4">
                            <Tooltip content="Delete">
                              <IconButton
                                variant="text"
                                onClick={() => handleDeleteRow(index)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </IconButton>
                            </Tooltip>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="4" className="p-4">
                          <div className="flex justify-center items-center gap-2">
                            <Tooltip content="Add">
                              <IconButton variant="text" onClick={handleAddRow}>
                                <PlusCircleIcon className="h-5 w-5" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </form>
            </CardBody>
            <CardFooter divider={true}>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </div>
            </CardFooter>
          </Card>
        </Layout>
      )}
    </>
  );
}
