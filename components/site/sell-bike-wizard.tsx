"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import { Camera, CheckCircle2, Circle, Sparkles, UploadCloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { bikes, formatBdt } from "@/lib/bikes-data";
import { cn } from "@/lib/utils";

const stepLabels = ["Identity", "Condition", "Media & Price"] as const;
const conditionPresets = ["Mint", "Good", "Fair"] as const;

type ConditionPreset = (typeof conditionPresets)[number];

type UploadedPhoto = {
  id: string;
  name: string;
  dataUrl: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to load image."));
    reader.readAsDataURL(file);
  });
}

export function SellBikeWizard() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const [odometerKm, setOdometerKm] = useState("");
  const [condition, setCondition] = useState<ConditionPreset | "">("");

  const [askingPrice, setAskingPrice] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPromoted, setIsPromoted] = useState(false);

  const makeOptions = useMemo(() => {
    return Array.from(new Set(bikes.map((bike) => bike.brand))).sort((a, b) => a.localeCompare(b));
  }, []);

  const modelOptions = useMemo(() => {
    if (!selectedMake) {
      return [];
    }

    return Array.from(
      new Set(
        bikes
          .filter((bike) => bike.brand === selectedMake)
          .map((bike) => bike.model)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [selectedMake]);

  const yearOptions = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => String(thisYear - index));
  }, []);

  const canProceedStep1 = Boolean(selectedMake && selectedModel && selectedYear);
  const canProceedStep2 = Number(odometerKm) > 0 && Boolean(condition);
  const canSubmitStep3 = Number(askingPrice) > 0 && photos.length > 0;

  const goToNext = () => {
    setErrorMessage("");

    if (currentStep === 1 && !canProceedStep1) {
      setErrorMessage("Select make, model, and year from BikeCatalog options to continue.");
      return;
    }

    if (currentStep === 2 && !canProceedStep2) {
      setErrorMessage("Enter odometer reading and choose a condition preset.");
      return;
    }

    setCurrentStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
  };

  const goToPrevious = () => {
    setErrorMessage("");
    setCurrentStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
  };

  const handleMakeChange = (value: string) => {
    setSelectedMake(value);
    setSelectedModel("");
    setErrorMessage("");
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (!selectedFiles.length) {
      return;
    }

    setErrorMessage("");

    if (photos.length + selectedFiles.length > 5) {
      setErrorMessage("You can upload up to 5 photos only.");
    }

    const acceptedFiles = selectedFiles.slice(0, Math.max(0, 5 - photos.length));

    try {
      const photoPayload = await Promise.all(
        acceptedFiles.map(async (file, index) => ({
          id: `${Date.now()}-${index}-${file.name}`,
          name: file.name,
          dataUrl: await readFileAsDataUrl(file),
        }))
      );

      setPhotos((prev) => [...prev, ...photoPayload]);
      event.target.value = "";
    } catch {
      setErrorMessage("One or more images could not be loaded. Please try another file.");
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
  };

  const submitListing = () => {
    setErrorMessage("");

    if (!canSubmitStep3) {
      setErrorMessage("Add at least one photo and set your asking price to continue.");
      return;
    }

    setIsSubmitted(true);
  };

  return (
    <div className="space-y-5">
      <Card className="border-slate-200 bg-white/90">
        <CardHeader>
          <CardTitle className="font-heading text-3xl uppercase tracking-wide text-slate-900">
            Sell Your Bike
          </CardTitle>
          <CardDescription>
            3-step wizard for standard users. Your make and model options are linked to BikeCatalog.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-2 md:grid-cols-3">
            {stepLabels.map((label, index) => {
              const step = (index + 1) as 1 | 2 | 3;
              const isActive = currentStep === step;
              const isDone = currentStep > step;

              return (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    isActive
                      ? "border-slate-900 bg-slate-100 text-slate-900"
                      : "border-slate-200 bg-white text-slate-600"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : isActive ? (
                    <Circle className="h-4 w-4 fill-slate-900 text-slate-900" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span>
                    Step {step}: {label}
                  </span>
                </div>
              );
            })}
          </div>

          {errorMessage ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
          ) : null}

          {currentStep === 1 ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="sell-make">Make</Label>
                <NativeSelect id="sell-make" value={selectedMake} onChange={(event) => handleMakeChange(event.target.value)} className="w-full">
                  <NativeSelectOption value="">Select make</NativeSelectOption>
                  {makeOptions.map((make) => (
                    <NativeSelectOption key={make} value={make}>
                      {make}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sell-model">Model</Label>
                <NativeSelect
                  id="sell-model"
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  className="w-full"
                  disabled={!selectedMake}
                >
                  <NativeSelectOption value="">Select model</NativeSelectOption>
                  {modelOptions.map((model) => (
                    <NativeSelectOption key={model} value={model}>
                      {model}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sell-year">Year</Label>
                <NativeSelect
                  id="sell-year"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                  className="w-full"
                >
                  <NativeSelectOption value="">Select year</NativeSelectOption>
                  {yearOptions.map((year) => (
                    <NativeSelectOption key={year} value={year}>
                      {year}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="odometer">Odometer Reading (km)</Label>
                <Input
                  id="odometer"
                  type="number"
                  min="1"
                  value={odometerKm}
                  onChange={(event) => setOdometerKm(event.target.value)}
                  placeholder="e.g. 12000"
                />
              </div>

              <div className="space-y-2">
                <Label>Condition Preset</Label>
                <div className="flex flex-wrap gap-2">
                  {conditionPresets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={condition === preset ? "default" : "outline"}
                      onClick={() => setCondition(preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="photo-upload">Upload Photos (up to 5)</Label>
                <label
                  htmlFor="photo-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 py-6 text-sm text-slate-600"
                >
                  <UploadCloud className="h-4 w-4" />
                  Click to upload bike photos
                </label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="sr-only"
                />
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {photos.map((photo) => (
                    <div key={photo.id} className="space-y-1">
                      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <Image
                          src={photo.dataUrl}
                          alt={photo.name}
                          width={180}
                          height={120}
                          className="h-24 w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="asking-price">Asking Price (BDT)</Label>
                <Input
                  id="asking-price"
                  type="number"
                  min="1"
                  value={askingPrice}
                  onChange={(event) => setAskingPrice(event.target.value)}
                  placeholder="e.g. 350000"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <p className="font-semibold">Listing Snapshot</p>
                <p>
                  {selectedMake || "-"} {selectedModel || "-"} ({selectedYear || "-"}) • {odometerKm || "-"} km • {condition || "-"}
                </p>
                <p>{askingPrice ? formatBdt(Number(askingPrice)) : "Set asking price"}</p>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="outline" onClick={goToPrevious} disabled={currentStep === 1}>
              Back
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < 3 ? (
                <Button type="button" onClick={goToNext}>
                  Continue
                </Button>
              ) : (
                <Button type="button" onClick={submitListing}>
                  Publish Listing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isSubmitted ? (
        <Card className="border-amber-300 bg-amber-50/80">
          <CardContent className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 font-semibold text-amber-900">
                <Sparkles className="h-4 w-4" />
                Want to sell 2x faster? Promote your bike for just Tk 500.
              </p>
              <p className="text-sm text-amber-800">
                Featured placement boosts visibility in buyer feeds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isPromoted ? (
                <Badge className="border-emerald-300 bg-emerald-100 text-emerald-800">Promotion Active</Badge>
              ) : null}
              <Button type="button" className="bg-amber-600 text-white hover:bg-amber-700" onClick={() => setIsPromoted(true)}>
                <Camera className="h-4 w-4" />
                Promote
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
