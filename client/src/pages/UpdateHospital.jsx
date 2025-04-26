import React, { useState, useEffect } from "react";
import {
  CardBody,
  Input,
  Card,
  CardHeader,
  Typography,
  Button,
  CardFooter,
} from "@material-tailwind/react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { apiRoutes } from "../utils/apiRoutes";
import { SyncLoadingScreen } from "../components/UI/LoadingScreen";
import Layout from "../layouts/PageLayout";

const UpdateHospitalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchHospitalDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${apiRoutes.hospitals}/${id}`, {
          withCredentials: true,
        });
        const resData = response.data;
        if (resData.ok) {
          const { data } = resData;
          setFormData({
            name: data.name,
          });

          console.log("Hospital details fetched successfully");
        } else {
          console.log("ERROR (fetch-hospital-details): ", resData.error);
        }
      } catch (error) {
        console.error(
          `ERROR (fetch-hospital-details): ${error?.response?.data?.message}`
        );
        toast.error(
          error?.response?.data?.message || "Failed to fetch Hospital details"
        );
      }
      setLoading(false);
    };

    fetchHospitalDetails();
  }, [id]);

  const handleChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      toast.error("Hospital name is required");
      return;
    }

    const data = {
      name: formData.name,
    };

    try {
      const response = await axios.put(`${apiRoutes.hospitals}/${id}`, data, {
        withCredentials: true,
      });
      console.log("Hospital updated successfully");
      toast.success("Hospital updated successfully");
      setTimeout(() => {
        navigate("/hospitals");
      }, 1000);
    } catch (error) {
      console.error(
        `ERROR (update-hospital): ${error?.response?.data?.message}`
      );
      toast.error(
        error?.response?.data?.message || "Failed to update Hospital"
      );
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
                      Hospital Form
                    </Typography>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:hidden">
                      <Button
                        className="flex items-center gap-3"
                        size="md"
                        onClick={() => {
                          navigate("/hospitals");
                        }}
                      >
                        Hospital List
                      </Button>
                    </div>
                  </div>
                  <Typography color="gray" className="mt-1 font-normal">
                    Update Hospital
                  </Typography>
                </div>
                <div className="hidden sm:flex shrink-0 flex-col gap-2 sm:flex-row">
                  <Button
                    className="flex items-center gap-3"
                    size="md"
                    onClick={() => {
                      navigate("/hospitals");
                    }}
                  >
                    Hospital List
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-3 sm:p-6">
              <form onSubmit={handleUpdate} className="flex flex-wrap gap-6">
                <div className="grid sm:grid-cols-1 gap-y-8 gap-x-4 w-full">
                  <div className="flex-col md:flex md:flex-row items-center justify-around p-1">
                    <div className="flex mr-4 md:w-72 w-full justify-end">
                      <label htmlFor="name">
                        Hospital Name <span className="text-red-800">*</span>:
                      </label>
                    </div>
                    <Input
                      id="name"
                      size="md"
                      label="Hospital Name"
                      className="w-full"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleChange(e.target.name, e.target.value)
                      }
                    />
                  </div>
                </div>
              </form>
            </CardBody>
            <CardFooter divider={true}>
              <div className="flex justify-end">
                <Button
                  className="flex items-center gap-3"
                  size="lg"
                  onClick={handleUpdate}
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
};

export default UpdateHospitalForm;
