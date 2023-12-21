import Link from 'next/link'
import styles from './page.module.css'
import { cookies } from 'next/headers';


const getSession = async () => {

  let token = cookies().get('session')?.value;

  let response = await fetch(`http://localhost:8080/api/oauth/verify/${token}`);
  let { validation } = await response.json();

  return validation;
}

export default async function Home() {

  let user = await getSession();

  return (
    <main className={styles.main}>

      {user ? (
        <div>
          <img src={user.picture} alt={user.name} />
          <h2> {user.name} </h2>
          <p> {user.email} </p>
          <Link href={'http://localhost:8080/api/oauth/signout'}>
            <button> Signout </button>
          </Link>
        </div>
      ) : (
        <Link href={'http://localhost:8080/api/oauth/google'}>
          <button> Signin with Google </button>
        </Link>
      )}

    </main>
  )
}
