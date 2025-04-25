import React, { useEffect, useState, useRef } from "react";
import {
  CardBody,
  Input,
  Card,
  CardHeader,
  Typography,
  Button,
  CardFooter,
  Select,
  Option,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import Layout from "../layouts/PageLayout";
import { setNavigateTimeout, setToastTimeout } from "../utils/customTimeout";
import * as XLSX from 'xlsx';

const FORM_KEY = "patientFormKey";

export default function AddPatientForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    age: "",
    email: "",
    bloodGroup: "",
    allergy: "",
    program: "",
    fatherOrSpouseName: "",
    category: "",
    gender: ""
  });

  // Excel import states
  const [excelData, setExcelData] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  useEffect(() => {
    const form_data = sessionStorage.getItem(FORM_KEY);
    if (form_data) {
      setFormData(JSON.parse(form_data));
    }
  }, []);

  const handleChange = (name, value) => {
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: value,
      };
      sessionStorage.setItem(FORM_KEY, JSON.stringify(updatedData));
      return updatedData;
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const validExtensions = ['xlsx', 'xls', 'csv'];
    if (!validExtensions.includes(fileExtension)) {
      setToastTimeout("error", "Invalid file format. Please upload an Excel file (.xlsx, .xls, .csv)", 200);
      resetFileUpload();
      return;
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setToastTimeout("error", "File size exceeds 5MB limit", 200);
      resetFileUpload();
      return;
    }
    
    setUploadedFile(file);
    setExcelData([]);
    setImportErrors([]);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    // Here you can handle the submission of the form
    const sendData = {
      name: formData.name,
      age: parseInt(formData.age),
      email: formData.email,
      bloodGroup: formData.bloodGroup,
      category: formData.category.toUpperCase(),
      gender: formData.gender.toUpperCase(),
    };
    if (formData.department) sendData.department = formData.department;
    if (formData.allergy) sendData.allergy = formData.allergy;
    if (formData.program) sendData.program = formData.program;
    if (formData.fatherOrSpouseName) sendData.fatherOrSpouseName = formData.fatherOrSpouseName;
    setLoading(true);
    try {
      const res = await axios.post(apiRoutes.patient, sendData, {
        withCredentials: true
      });
      const data = res?.data;
      console.log("patient record saved successfully");
      setToastTimeout("success", "Patient added successfully", 200);

      sessionStorage.removeItem(FORM_KEY);

      setNavigateTimeout(navigate, "/patient", 100);
    } catch (error) {
      console.error(
        `ERROR (create-patient-record): ${error?.response?.data?.message}`
      );
      setToastTimeout(
        "error",
        error?.response?.data?.message || "Patient record creation failed",
        200
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create template data to match the exact format in the image
    const template = [
      {
        name: "John Doe",
        department: "COMPUTER_SCIENCE",
        age: 25,
        email: "john.doe@example.com",
        bloodGroup: "A+",
        allergy: "Penicillin",
        program: "BTECH",
        fatherOrSpouseName: "James Doe",
        category: "Student",
        gender: "Male"
      },
      {
        name: "Jane Smith",
        department: "ELECTRICAL",
        age: 22,
        email: "jane.smith@example.com",
        bloodGroup: "O-",
        allergy: "",
        program: "MTECH",
        fatherOrSpouseName: "Robert Smith",
        category: "Student",
        gender: "Female"
      },
      {
        name: "Alice Johnson",
        department: "MECHANICAL",
        age: 24,
        email: "alice.j@example.com",
        bloodGroup: "B+",
        allergy: "Dust",
        program: "BTECH",
        fatherOrSpouseName: "Michael Johnson",
        category: "Student",
        gender: "Female"
      },
      {
        name: "Bob Brown",
        department: "CIVIL",
        age: 23,
        email: "bob.brown@example.com",
        bloodGroup: "AB+",
        allergy: "None",
        program: "BTECH",
        fatherOrSpouseName: "Thomas Brown",
        category: "Student",
        gender: "Male"
      },
      {
        name: "Carol White",
        department: "COMPUTER_SCIENCE",
        age: 26,
        email: "carol.white@example.com",
        bloodGroup: "O+",
        allergy: "",
        program: "MTECH",
        fatherOrSpouseName: "Edward White",
        category: "Student",
        gender: "Female"
      }
    ];

    // Define the exact column order as shown in the image
    const columnOrder = [
      "name",
      "department",
      "age",
      "email",
      "bloodGroup",
      "allergy",
      "program",
      "fatherOrSpouseName",
      "category",
      "gender"
    ];

    // Create a new workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // First create a worksheet with just the headers
    const ws = XLSX.utils.aoa_to_sheet([columnOrder]);
    
    // Then add the data rows starting at row 2 (after the header)
    XLSX.utils.sheet_add_json(ws, template, { 
      header: columnOrder,
      skipHeader: true, // Skip header since we already added it
      origin: 'A2' // Start adding at row 2
    });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, "patient_template.xlsx");
  };

  const previewExcelData = () => {
    if (!uploadedFile) {
      setToastTimeout("error", "Please select a file first", 200);
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const binaryData = evt.target.result;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        
        // Get header row from the first row
        const headerRange = XLSX.utils.decode_range(ws['!ref']);
        const headers = [];
        for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
          const cell = ws[XLSX.utils.encode_cell({r: headerRange.s.r, c: C})];
          headers[C] = cell?.v || '';
        }
        
        // Parse data starting from row 2 (index 1)
        const data = [];
        for (let R = headerRange.s.r + 1; R <= headerRange.e.r; ++R) {
          const row = {};
          let hasData = false;
          
          for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
            const header = headers[C];
            if (!header) continue;
            
            const cell = ws[XLSX.utils.encode_cell({r: R, c: C})];
            const value = cell ? cell.v : '';
            
            // Skip empty rows
            if (value) hasData = true;
            
            row[header] = value;
          }
          
          if (hasData) data.push(row);
        }
        
        if (data.length === 0) {
          setToastTimeout("error", "No data found in the uploaded file", 200);
          setLoading(false);
          return;
        }
        
        // Map column names if they don't exactly match expected format
        const standardizedData = data.map(row => {
          const standardRow = {};
          
          // Map each field to the standardized field name
          const columnMapping = {
            "name": ["name", "Name", "NAME", "full name", "Full Name", "FULL NAME"],
            "department": ["department", "Department", "DEPARTMENT", "dept", "Dept", "DEPT"],
            "age": ["age", "Age", "AGE"],
            "email": ["email", "Email", "EMAIL", "e-mail", "E-mail", "E-MAIL"],
            "bloodGroup": ["bloodGroup", "Blood Group", "BLOOD GROUP", "blood group", "Blood", "BLOOD"],
            "allergy": ["allergy", "Allergy", "ALLERGY", "allergies", "Allergies", "ALLERGIES"],
            "program": ["program", "Program", "PROGRAM"],
            "fatherOrSpouseName": ["fatherOrSpouseName", "Father/Spouse Name", "Father Spouse Name", "Father's Name", "Spouse Name"],
            "category": ["category", "Category", "CATEGORY"],
            "gender": ["gender", "Gender", "GENDER", "sex", "Sex", "SEX"]
          };
          
          // For each standard field, find a matching column in the row
          Object.entries(columnMapping).forEach(([standardField, possibleNames]) => {
            // Find if any of the possible field names exist in the row
            const matchingKey = Object.keys(row).find(key => 
              possibleNames.some(name => name.toLowerCase() === key.toLowerCase())
            );
            
            if (matchingKey) {
              standardRow[standardField] = row[matchingKey];
            } else {
              standardRow[standardField] = '';
            }
          });
          
          return standardRow;
        });
        
        setExcelData(standardizedData);
        const validationResult = validateExcelData(standardizedData);
        setPreviewOpen(true);
        setLoading(false);
      } catch (error) {
        console.error("Excel parsing error:", error);
        setToastTimeout("error", "Error parsing Excel file. Please check the file format.", 200);
        setLoading(false);
      }
    };
    
    reader.onerror = () => {
      setToastTimeout("error", "Error reading file", 200);
      setLoading(false);
    };
    
    reader.readAsBinaryString(uploadedFile);
  };

  const validateExcelData = (data) => {
    const errors = [];
    
    data.forEach((patient, index) => {
      // Required fields validation (with more flexible checking)
      if (!patient.name && patient.name !== 0) 
        errors.push(`Row ${index + 2}: Name is required`);
      
      if ((!patient.age && patient.age !== 0) || isNaN(Number(patient.age))) 
        errors.push(`Row ${index + 2}: Age is required and must be a number`);
      
      if (!patient.email) 
        errors.push(`Row ${index + 2}: Email is required`);
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
        errors.push(`Row ${index + 2}: Invalid email format`);
      }
      
      if (!patient.bloodGroup) 
        errors.push(`Row ${index + 2}: Blood Group is required`);
      else if (!bloodGroups.some(bg => 
        bg.toLowerCase() === patient.bloodGroup.toLowerCase()
      )) {
        errors.push(`Row ${index + 2}: Invalid blood group (accepted values: ${bloodGroups.join(', ')})`);
      }
      
      if (!patient.category) 
        errors.push(`Row ${index + 2}: Category is required`);
      else {
        // Category validation (case insensitive)
        const validCategories = ["Student", "Faculty", "Staff", "Visitor"];
        if (!validCategories.some(cat => 
          cat.toLowerCase() === patient.category.toLowerCase()
        )) {
          errors.push(`Row ${index + 2}: Invalid category (accepted values: ${validCategories.join(', ')})`);
        }
      }
      
      if (!patient.gender) 
        errors.push(`Row ${index + 2}: Gender is required`);
      else {
        // Gender validation (case insensitive)
        const validGenders = ["Male", "Female"];
        if (!validGenders.some(gen => 
          gen.toLowerCase() === patient.gender.toLowerCase()
        )) {
          errors.push(`Row ${index + 2}: Invalid gender (accepted values: ${validGenders.join(', ')})`);
        }
      }
      
      // Convert age to number for validation
      const age = Number(patient.age);
      if (!isNaN(age) && (age < 1 || age > 100)) {
        errors.push(`Row ${index + 2}: Age must be between 1 and 100`);
      }
    });
    
    setImportErrors(errors);
    return errors.length === 0;
  };

  const handleBulkImport = async () => {
    if (importErrors.length > 0) {
      setToastTimeout("error", "Please fix the validation errors before importing", 200);
      return;
    }
    
    setLoading(true);
    setPreviewOpen(false); // Close the preview dialog immediately
    
    try {
      // Process each patient record
      const results = [];
      
      for (const patient of excelData) {
        const sendData = {
          name: patient.name,
          age: parseInt(patient.age),
          email: patient.email,
          bloodGroup: patient.bloodGroup,
          category: String(patient.category).toUpperCase(),
          gender: String(patient.gender).toUpperCase(),
        };
        
        // Only include non-empty fields
        if (patient.department) sendData.department = patient.department;
        if (patient.allergy) sendData.allergy = patient.allergy;
        if (patient.program) sendData.program = patient.program;
        if (patient.fatherOrSpouseName) sendData.fatherOrSpouseName = patient.fatherOrSpouseName;
        
        try {
          const res = await axios.post(apiRoutes.patient, sendData, {
            withCredentials: true
          });
          results.push({ success: true, data: res.data });
        } catch (error) {
          results.push({ 
            success: false, 
            error: error?.response?.data?.message || "Failed to add patient",
            patient: patient.name
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        setToastTimeout("success", `Successfully imported ${successCount} patients`, 200);
        setNavigateTimeout(navigate, "/patient", 500);
      } else if (successCount > 0) {
        const failedPatients = results.filter(r => !r.success)
          .map(r => r.patient)
          .slice(0, 3) // Limit to first 3 failures to keep toast readable
          .join(", ");
          
        const moreFailures = failCount > 3 ? ` and ${failCount - 3} more` : "";
        
        setToastTimeout(
          "warning", 
          `Imported ${successCount} patients, ${failCount} failed. Failed patients: ${failedPatients}${moreFailures}`, 
          3000
        );
        
        // Still navigate if some imports succeeded
        setTimeout(() => {
          navigate("/patient");
        }, 3000);
      } else {
        setToastTimeout("error", "Bulk import failed. Please check your data and try again.", 3000);
      }
      
      resetFileUpload();
    } catch (error) {
      console.error(`ERROR (bulk-import): ${error}`);
      setToastTimeout("error", "Bulk import failed", 200);
    } finally {
      setLoading(false);
    }
  };
  
  const resetFileUpload = () => {
    setUploadedFile(null);
    setExcelData([]);
    setImportErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                  <div className="flex flex-row items-center justify-between gap-8">
                    <Typography variant="h5" color="blue-gray">
                      Patient Form
                    </Typography>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:hidden">
                      <Button
                        className="flex items-center gap-3"
                        size="md"
                        onClick={() => {
                          navigate("/patient");
                        }}
                      >
                        Patient List
                      </Button>
                    </div>
                  </div>
                  <Typography color="gray" className="mt-1 font-normal">
                    Add a new patient to the list.
                  </Typography>
                </div>
                <div className="hidden sm:flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {
                      navigate("/patient");
                    }}
                  >
                    Patient List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Tabs value={activeTab} onChange={(value) => setActiveTab(value)}>
                <TabsHeader>
                  <Tab value="manual">Manual Entry</Tab>
                  <Tab value="import">Bulk Import</Tab>
                </TabsHeader>
                <TabsBody>
                  <TabPanel value="manual">
                    <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
                      <div className="grid md:grid-cols-2 gap-y-8 gap-x-4 w-full">
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-4 w-full md:w-72 justify-end">
                            <label htmlFor="name">
                              Full Name <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Input
                            id="name"
                            size="md"
                            label="Name"
                            className="w-full"
                            name="name"
                            value={formData.name}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="department">Department:</label>
                          </div>
                          <Select
                            id="department"
                            label="Select"
                            name="department"
                            value={formData.department}
                            onChange={(value) => handleChange("department", value)}
                          >
                            <Option value="COMPUTER_SCIENCE">Computer Science</Option>
                            <Option value="ELECTRICAL">Electrical</Option>
                            <Option value="MECHANICAL">Mechanical</Option>
                            <Option value="MATHEMATICS_COMPUTING">
                              Mathematics & Computing
                            </Option>
                            <Option value="CHEMICAL">Chemical</Option>
                            <Option value="CIVIL">Civil</Option>
                            <Option value="METALLURGY">Metallurgy</Option>
                            <Option value="ENGINEERING_PHYSICS">
                              Engineering Physics
                            </Option>
                            <Option value="PHYSICS">Physics</Option>
                            <Option value="CHEMISTRY">Chemistry</Option>
                            <Option value="BIOLOGY">Biology</Option>
                            <Option value="MATHEMATICS">Mathematics</Option>
                            <Option value="HUMANITIES">Humanities</Option>
                          </Select>
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="age">
                              Age <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Input
                            id="age"
                            size="md"
                            label="Age"
                            type="number"
                            min={1}
                            max={100}
                            name="age"
                            value={formData.age}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="email">
                              Email <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Input
                            id="email"
                            size="md"
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="allergy">Allergies(if any):</label>
                          </div>
                          <Input
                            id="allergy"
                            size="md"
                            label="Allergies"
                            name="allergy"
                            type="allergy"
                            value={formData.allergy}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="gender">
                              Gender <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Select
                            id="gender"
                            label="Select"
                            name="gender"
                            value={formData.gender}
                            onChange={(value) => handleChange("gender", value)}
                          >
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            {/* <Option value="Other">Other</Option> */}
                          </Select>
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="bloodGroup">
                              Blood Group <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Select
                            id="bloodGroup"
                            label="Select Type"
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={(value) => handleChange("bloodGroup", value)}
                          >
                            {bloodGroups.map((group) => (
                              <Option key={group} value={group}>
                                {group}
                              </Option>
                            ))}
                          </Select>
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="category">
                              Category <span className="text-red-800">*</span>:
                            </label>
                          </div>
                          <Select
                            id="category"
                            label="Category"
                            name="category"
                            value={formData.category}
                            onChange={(value) => handleChange("category", value)}
                          >
                            <Option value="Student">Student</Option>
                            <Option value="Faculty">Faculty</Option>
                            <Option value="Staff">Staff</Option>
                            <Option value="Visitor">Visitor</Option>
                          </Select>
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="program">Program</label>:
                          </div>
                          <Select
                            id="program"
                            label="Select"
                            name="program"
                            value={formData.program}
                            onChange={(value) => handleChange("program", value)}
                          >
                            <Option value="BTECH">BTech</Option>
                            <Option value="MTECH">MTech</Option>
                            <Option value="DUAL_DEGREE">Dual Degree</Option>
                            <Option value="PHD">PHD</Option>
                          </Select>
                        </div>
                        <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                          <div className="flex mr-2 w-full md:w-72 justify-end">
                            <label htmlFor="fatherOrSpouseName">Father's/Spouse's Name</label>:
                          </div>
                          <Input
                            id="fatherOrSpouseName"
                            size="md"
                            label="Father's Name"
                            name="fatherOrSpouseName"
                            value={formData.fatherOrSpouseName}
                            onChange={(e) => handleChange(e.target.name, e.target.value)}
                          />
                        </div>
                      </div>
                    </form>
                  </TabPanel>
                  <TabPanel value="import">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-4">
                        <Typography variant="h6" color="blue-gray">
                          Import Patients from Excel
                        </Typography>
                        <Typography color="gray" className="text-sm">
                          Upload an Excel file to add multiple patients at once. Download the template to ensure your data is in the correct format.
                        </Typography>
                        
                        <div className="flex flex-col gap-4">
                          <Button 
                            color="blue" 
                            className="max-w-xs"
                            onClick={downloadTemplate}
                          >
                            Download Template
                          </Button>
                          
                          <div className="border border-blue-gray-200 rounded-lg p-4 mt-2">
                            <Typography variant="h6" color="blue-gray" className="mb-2">
                              Upload Excel File
                            </Typography>
                            
                            <div className="flex flex-col gap-3">
                              <input
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                                className="block w-full text-sm text-gray-500
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-md file:border-0
                                  file:text-sm file:font-semibold
                                  file:bg-blue-50 file:text-blue-700
                                  hover:file:bg-blue-100"
                              />
                              
                              {uploadedFile && (
                                <div className="flex items-center gap-2 text-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <Typography className="text-green-700">
                                    {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                                  </Typography>
                                  <Button 
                                    size="sm" 
                                    color="red" 
                                    variant="text" 
                                    className="ml-2 p-1" 
                                    onClick={resetFileUpload}
                                  >
                                    Clear
                                  </Button>
                                </div>
                              )}
                              
                              <Button 
                                color="green" 
                                className="mt-2 max-w-xs"
                                disabled={!uploadedFile} 
                                onClick={previewExcelData}
                              >
                                Preview Data
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <Typography color="blue-gray" className="font-semibold mb-2">
                          Guidelines:
                        </Typography>
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          <li>Required fields: Name, Age, Email, Blood Group, Category, Gender</li>
                          <li>Supported formats: .xlsx, .xls, .csv</li>
                          <li>Maximum file size: 5MB</li>
                          <li>Download the template for the correct format</li>
                        </ul>
                      </div>
                    </div>
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </CardBody>
            <CardFooter divider={true}>
              <div className="flex justify-end">
                {activeTab === "manual" ? (
                  <Button
                    className="flex items-center gap-3"
                    size="lg"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    className="flex items-center gap-3"
                    size="lg"
                    onClick={previewExcelData}
                    disabled={!uploadedFile}
                  >
                    Preview & Import
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </Layout>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} handler={() => setPreviewOpen(false)} size="xl">
        <DialogHeader>
          <Typography variant="h5">
            Preview Patient Data
          </Typography>
        </DialogHeader>
        <DialogBody divider className="overflow-y-auto max-h-96">
          {importErrors.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
              <Typography color="red" className="font-semibold mb-2">
                Please fix the following errors:
              </Typography>
              <ul className="list-disc pl-5">
                {importErrors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {excelData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr>
                    {Object.keys(excelData[0]).map((header) => (
                      <th key={header} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                        <Typography variant="small" color="blue-gray" className="font-bold">
                          {header}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-blue-gray-50/50" : ""}>
                      {Object.entries(row).map(([key, value], cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`} className="p-4 border-b border-blue-gray-50">
                          <Typography variant="small" color="blue-gray">
                            {value?.toString() || ""}
                          </Typography>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Typography color="gray" className="text-center py-4">
              No data to preview
            </Typography>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setPreviewOpen(false)} className="mr-2">
            Cancel
          </Button>
          <Button 
            color="green" 
            onClick={handleBulkImport}
            disabled={importErrors.length > 0 || excelData.length === 0}
          >
            Import {excelData.length} Patients
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
