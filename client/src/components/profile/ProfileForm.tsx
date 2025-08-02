// client/src/components/profile/ProfileForm.tsx
import { IUserProfile } from '@/types';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  initialData: IUserProfile;
  onSubmit?: (data: IUserProfile) => void;
};

export default function ProfileForm({ initialData, onSubmit }: Props) {
  const { register, handleSubmit } = useForm<IUserProfile>({ defaultValues: initialData });

  return (
    <form onSubmit={handleSubmit(onSubmit || (() => {}))} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input {...register('name')} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" {...register('email')} />
      </div>
      <div>
        <Label>Phone</Label>
        <Input {...register('phone')} />
      </div>
      <div>
        <Label>Address</Label>
        <Input {...register('address')} />
      </div>
      <Button type="submit">Update Profile</Button>
    </form>
  );
}
