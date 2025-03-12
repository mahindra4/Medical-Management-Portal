import React, { useEffect, useState } from "react";
import Select from "react-select";
import {useDebounce} from 'react-use'

import {
  CardBody,
  Input,
  Card,
  CardHeader,
  Typography,
  Button,
  CardFooter,
  Option,
  Select as MaterialSelect,
  input,
  select,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import Layout from "../layouts/PageLayout";
import { SyncLoadingScreen } from "./UI/LoadingScreen";
import { use } from "react";

export function AddMedicineForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    medicineType: "",
    category: "",
    medicineDetails: "",
    saltName: "",
    brandName: "",
    strength: "",
  });

  const [categories, setCategories] = useState([]);
  const [brandName, setBrandName] = useState("");
  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrandName, setSelectedBrandName] = useState(null);
  // useEffect(() => {
  //   console.log('updated brand options: ',brandOptions)
  // }, [brandName])

  useDebounce(async () => {
    // debounced input
    if(!brandName) return;
    const response = await fetchRelatedMedicines(brandName);
    const data = response.data
    let options = data.map((brandName) => ({value: brandName, label: brandName}))
    if(!options.some(option => option.value === brandName)){
      options.unshift({value: brandName, label: brandName})
    }
    setBrandOptions(options);
  },500,[brandName])

  useEffect(
    () => async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    },
    []
  );

  const fetchCategories = async () => {
    try {
      const response = await axios.get(apiRoutes.category, {
        withCredentials: true,
      });
      console.log(response.data.data);
      setCategories(response.data.data);
    } catch (error) {
      console.error(`ERROR (add-medicine): ${error?.response?.data?.message}`);
      toast.error(
        error?.response?.data?.message || "Failed to fetch Categories"
      );
    }
  };

  const handleChange = (name, value) => {
    // console.log(e.target);
    // const { name, value } = e.target;
    console.log(name, value);
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCategoryChange = (selectedCategory) => {
    const selectedCategoryvalue = selectedCategory ? selectedCategory : "";
    setFormData((prevData) => ({
      ...prevData,
      category: selectedCategoryvalue,
    }));
  };


  const fetchRelatedMedicines = async (input) => {
    try{
        const n = 100;
        const response = await fetch(`https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${input}&maxEntries=${n}`);
        const resJson = await response.json();
        const medicines = resJson?.approximateGroup?.candidate;
        const filteredMeds = medicines.filter(medicine => medicine.name)
        const names = filteredMeds.map(medicine => medicine.name)
        return {
            ok: true,
            data: names,
        };
    } catch(err) {
        console.log(err);
        return {
            ok: false,
            data: [],
        }
    }
  }
  

  const handleBrandNameInputChange = (inputBrandName, {action}) => {

    // if(action != 'input-change') return;
    console.log("handle brand name input change")
    console.log(inputBrandName)
    setBrandName(inputBrandName)
  }

  const handleBrandNameChange = (selectedBrandName) => {
    console.log(selectedBrandName)
    setSelectedBrandName(selectedBrandName);
    const brandNameVal = selectedBrandName.value;
    setFormData((prevData) => ({
      ...prevData,
      brandName: brandNameVal
    }))
  }


  // const handleBrandNameChange = (inputBrandName) {}
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    // Here you can handle the submission of the form
    const data = {
      // medicineType: formData.medicineType,
      categoryId: formData.category.value,
      // medicineDetails: formData.medicineDetails,
      saltName: formData.saltName,
      brandName: formData.brandName,
    };
    // console.log(data);
    setLoading(true);
    try {
      const response = await axios.post(apiRoutes.medicine, data, {
        withCredentials: true,
      });
      console.log(response);
      toast.success("Medicine added successfully");
      setTimeout(() => {
        navigate("/medicine");
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to add Medicine");
    }
    setLoading(false);
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
                      Medicine Form
                    </Typography>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:hidden">
                      <Button
                        className="flex items-center gap-3"
                        size="md"
                        onClick={() => {
                          navigate("/medicine");
                        }}
                      >
                        Medicine List
                      </Button>
                    </div>
                  </div>
                  <Typography color="gray" className="mt-1 font-normal">
                    Add a new medicine to the list.
                  </Typography>
                </div>
                <div className="hidden sm:flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {
                      navigate("/medicine");
                    }}
                  >
                    Medicine List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
                <div className="grid md:grid-cols-2 gap-y-8 gap-x-4 w-full">
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="brandName">
                        Brand Name <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    {/* <Input
                      id="brandName"
                      size="md"
                      label="Brand Name"
                      name="brandName"
                      value={formData.brandName}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    /> */}

                    <Select
                      id="brandName"
                      options={brandOptions}
                      name="brandname"
                      value={selectedBrandName}
                      onInputChange={handleBrandNameInputChange}
                      onChange={handleBrandNameChange}
                      placeholder="Brand Name"
                      isClearable={true}
                      className="w-full"
                    />
                    {/* <h1>{brandName}</h1> */}
                    {/* <div>
                      {
                        brandOptions.map((option) => <p>{option.value}</p>)
                      }
                    </div> */}
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="saltName">
                        Salt Name <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="saltName"
                      size="md"
                      label="Salt Name"
                      name="saltName"
                      value={formData.saltName}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="category">
                        Category <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Select
                      id="category"
                      options={categories.map((category) => ({
                        value: category.id,
                        label: category.categoryName,
                        strengthType: category.strengthType,
                      }))}
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      isClearable={true}
                      placeholder="Select Category"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end ">
                      <label htmlFor="strength">Strength:</label>
                    </div>
                    <Input
                      id="strength"
                      size="md"
                      label={formData.category.strengthType}
                      disabled
                      name="strength"
                      value={formData.strength}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="medicineDetails">Medicine Details:</label>
                    </div>
                    <Input
                      id="medicineDetails"
                      size="md"
                      label="Medicine Details"
                      name="medicineDetails"
                      value={formData.medicineDetails}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>

                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-2 w-full md:w-72 justify-end">
                      <label htmlFor="medicineType">Medicine Type:</label>
                    </div>
                    <MaterialSelect
                      id="medicineType"
                      label="Select Type"
                      name="medicineType"
                      value={formData.medicineType}
                      onChange={(value) => handleChange("medicineType", value)}
                    >
                      <Option value="Generic">Generic</Option>
                      <Option value="Medical Kit">Medical Kit</Option>
                      <Option value="Injection">Injection</Option>
                      <Option value="Surgicals">Surgicals</Option>
                    </MaterialSelect>
                  </div>
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
