import { redirect } from 'next/navigation';

export default function CategoriesRedirect() {
  redirect('/home?tab=taxonomy');
}
