import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Users, Calendar, Tag, DollarSign, AlertCircle } from 'lucide-react';
import { activitiesApi } from '@/lib/api/activities.api';
import { MapPicker } from '@/components/MapPicker';
import { LocationSelector } from '@/components/LocationSelector';

const CATEGORIES = ['Music', 'Sports', 'Art', 'Food', 'Technology', 'Outdoors', 'Education', 'Social', 'Fitness', 'Gaming', 'Business'];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Select a category'),
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Select a time'),
  address: z.string().min(3, 'Enter a location or meeting link'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  capacity: z.number().min(2).max(500),
  isFree: z.boolean(),
  isOnline: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().optional(),
  tags: z.string(),
}).superRefine((data, ctx) => {
  if (!data.isOnline && (!data.city || !data.state || !data.country)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Full location (Country, State, City) is required for in-person activities", path: ["city"] });
  }
});

type FormData = z.infer<typeof schema>;

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold text-olive-800 mb-1.5">{label}</label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
  </div>
);

export function CreateActivityPage() {
  const navigate = useNavigate();
  const [isFree, setIsFree] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { isFree: true, capacity: 20, isOnline: false },
  });

  const isOnline = watch('isOnline');

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      activitiesApi.create({
        title: data.title,
        description: data.description,
        category: data.category,
        startTime: `${data.date}T${data.time}:00.000Z`,
        address: data.address,
        city: data.isOnline ? undefined : data.city,
        state: data.isOnline ? undefined : data.state,
        country: data.isOnline ? undefined : data.country,
        latitude: data.isOnline ? undefined : data.latitude,
        longitude: data.isOnline ? undefined : data.longitude,
        maxParticipants: data.capacity,
        isFree: data.isFree,
        price: data.isFree ? undefined : data.price,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      navigate(`/activities/${created.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to create activity. Please try again.';
      setApiError(msg);
    },
  });

  const onSubmit = (data: FormData) => {
    setApiError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-olive-600 hover:text-olive-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h1 className="page-title mb-1">Create Activity ✨</h1>
        <p className="text-olive-500">Fill in the details and start gathering your crew</p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6 space-y-5">
          <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900">Basic Info</h2>

          <Field label="Activity Title *" error={errors.title?.message}>
            <input {...register('title')} placeholder="e.g., Guitar Jam Session at the Park" className="input-field" />
          </Field>

          <Field label="Description *" error={errors.description?.message}>
            <textarea {...register('description')} rows={4} placeholder="Describe what people can expect, who should join, what to bring..." className="input-field resize-none" />
          </Field>

          <Field label="Category *" error={errors.category?.message}>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
              <select {...register('category')} className="input-field pl-10 appearance-none cursor-pointer">
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </Field>

          <Field label="Tags (comma separated)" error={errors.tags?.message}>
            <input {...register('tags')} placeholder="e.g., Beginner Friendly, Outdoor, Free" className="input-field" />
          </Field>
        </div>

        {/* Date & Location */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900">Date & Location</h2>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-olive-700">
              <input type="checkbox" {...register('isOnline')} className="rounded border-olive-300 text-olive-500 focus:ring-olive-500 w-4 h-4" />
              Online Activity
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Date *" error={errors.date?.message}>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input {...register('date')} type="date" className="input-field pl-10" />
              </div>
            </Field>
            <Field label="Time *" error={errors.time?.message}>
              <input {...register('time')} type="time" className="input-field" />
            </Field>
          </div>

          {isOnline ? (
            <Field label="Meeting Link *" error={errors.address?.message}>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                <input {...register('address')} placeholder="e.g., https://meet.google.com/..." className="input-field pl-10" />
              </div>
            </Field>
          ) : (
            <>
              <Field label="Venue / Address *" error={errors.address?.message}>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                  <input {...register('address')} placeholder="e.g., Golden Gate Park, San Francisco" className="input-field pl-10" />
                </div>
              </Field>

              <Field label="Location *" error={errors.city?.message}>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <LocationSelector
                      country={watch('country')}
                      state={watch('state')}
                      city={field.value}
                      onChange={(loc) => {
                        setValue('country', loc.country);
                        setValue('state', loc.state);
                        setValue('city', loc.city);
                      }}
                    />
                  )}
                />
              </Field>
              
              <Field label="Pin on Map (Optional)" error={errors.latitude?.message}>
                <Controller
                  name="latitude"
                  control={control}
                  render={({ field }) => (
                    <MapPicker
                      value={field.value ? { lat: field.value, lng: watch('longitude')! } : undefined}
                      onChange={(val) => {
                        setValue('latitude', val.lat);
                        setValue('longitude', val.lng);
                      }}
                    />
                  )}
                />
              </Field>
            </>
          )}
        </div>

        {/* Capacity & Pricing */}
        <div className="card p-6 space-y-5">
          <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900">Capacity & Pricing</h2>

          <Field label="Maximum Attendees *" error={errors.capacity?.message}>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
              <Controller
                name="capacity"
                control={control}
                render={({ field }) => (
                  <input {...field} type="number" min={2} max={500} placeholder="20" className="input-field pl-10"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                )}
              />
            </div>
          </Field>

          <div>
            <label className="block text-sm font-semibold text-olive-800 mb-3">Pricing</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${isFree ? 'border-olive-500 bg-olive-500 text-white' : 'border-olive-100 text-olive-600 hover:border-olive-300'}`}
              >
                🟢 Free
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`flex-1 py-3 rounded-2xl border-2 font-semibold text-sm transition-all ${!isFree ? 'border-olive-500 bg-olive-500 text-white' : 'border-olive-100 text-olive-600 hover:border-olive-300'}`}
              >
                💰 Paid
              </button>
            </div>
            {!isFree && (
              <div className="mt-3">
                <Field label="Price per person (₹)" error={errors.price?.message}>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-400" />
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <input {...field} type="number" min={1} placeholder="e.g., 200" className="input-field pl-10"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      )}
                    />
                  </div>
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-4">
            Cancel
          </button>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 py-4 text-base disabled:opacity-70">
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publishing...
              </span>
            ) : '🌿 Publish Activity'}
          </button>
        </div>
      </form>
    </div>
  );
}
