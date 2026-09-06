import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/lib/api/users.api';
import { LocationSelector } from '@/components/LocationSelector';
import { Controller } from 'react-hook-form';

interface FormValues {
  displayName: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  interests: string;
  skills: string;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-semibold text-olive-800 mb-1.5">{label}</label>
    {children}
  </div>
);

export function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);
  const storeUser = useAuthStore((s) => s.user);

  const { data: profile } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: usersApi.getMe,
    initialData: storeUser ?? undefined,
  });

  const { register, handleSubmit, control, watch, setValue, formState: { isDirty } } = useForm<FormValues>({
    values: {
      displayName: profile?.profile?.displayName ?? '',
      bio: profile?.profile?.bio ?? '',
      city: profile?.profile?.city ?? '',
      state: profile?.profile?.state ?? '',
      country: profile?.profile?.country ?? '',
      interests: profile?.userInterests?.map(ui => ui.interest.name).join(', ') ?? '',
      skills: profile?.userSkills?.map(us => us.skill.name).join(', ') ?? '',
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => usersApi.updateMe({
      ...data,
      interests: data.interests.split(',').map(s => s.trim()).filter(Boolean),
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
    }),
    onSuccess: (updated) => {
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      navigate('/profile');
    },
  });

  const user = profile ?? storeUser;
  const avatar = user?.profile?.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`;

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-olive-600 hover:text-olive-800 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Profile
      </button>

      <h1 className="page-title mb-8">Edit Profile ✏️</h1>

      {/* Avatar */}
      <div className="card p-6 mb-6">
        <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div className="relative">
            <img src={avatar} alt="" className="w-20 h-20 rounded-3xl ring-2 ring-olive-200" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-olive-500 rounded-full flex items-center justify-center shadow-btn">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-olive-900 mb-1">Upload a new photo</p>
            <p className="text-xs text-olive-500">JPG or PNG, max 2MB</p>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
        <div className="card p-6 mb-6 space-y-5">
          <h2 style={{ fontFamily: 'var(--font-poppins)' }} className="font-semibold text-olive-900">Basic Information</h2>
          <Field label="Display Name">
            <input {...register('displayName')} className="input-field" placeholder="Your full name" />
          </Field>
          <div>
            <label className="block text-sm font-semibold text-olive-800 mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-olive-400 text-sm">@</span>
              <input value={user?.username ?? ''} disabled className="input-field pl-8 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-olive-400 mt-1">Username cannot be changed</p>
          </div>
          <Field label="Bio">
            <textarea {...register('bio')} rows={3} placeholder="Tell people a bit about yourself..." className="input-field resize-none" />
          </Field>
          <Field label="Location">
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <LocationSelector
                  country={watch('country')}
                  state={watch('state')}
                  city={field.value}
                  onChange={(loc) => {
                    setValue('country', loc.country, { shouldDirty: true });
                    setValue('state', loc.state, { shouldDirty: true });
                    setValue('city', loc.city, { shouldDirty: true });
                  }}
                  className="sm:grid-cols-3"
                />
              )}
            />
          </Field>
          
          <Field label="Interests">
            <input {...register('interests')} placeholder="e.g. Reading, Traveling, Movies (comma separated)" className="input-field" />
            <p className="text-xs text-olive-400 mt-1">Separate interests with commas</p>
          </Field>

          <Field label="Skills">
            <input {...register('skills')} placeholder="e.g. React, TypeScript, Tennis (comma separated)" className="input-field" />
            <p className="text-xs text-olive-400 mt-1">Separate skills with commas</p>
          </Field>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 py-4">Cancel</button>
          <button
            type="submit"
            disabled={saveMutation.isPending || !isDirty}
            className="btn-primary flex-1 py-4 text-base disabled:opacity-70"
          >
            {saveMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
