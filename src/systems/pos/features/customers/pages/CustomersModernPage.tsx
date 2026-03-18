import { useEffect, useMemo, useState } from "react";
import { HttpClient } from "../../../../shared/api/HttpClient";
import { CustomerApi } from "../api/CustomerApi";
import type { Customer } from "../models/Customer";
import { CustomerService } from "../services/CustomerService";

const POS_API_URL = "https://apipos.ravekh.com/api/";

interface CustomersModernPageProps {
  token: string;
  businessId: string;
}

export const CustomersModernPage = ({ token, businessId }: CustomersModernPageProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const customerService = useMemo(() => {
    const httpClient = new HttpClient(POS_API_URL);
    const customerApi = new CustomerApi(httpClient);
    return new CustomerService(customerApi);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      const result = await customerService.listCustomers(token, businessId, search);

      if (!isMounted) {
        return;
      }

      if (result.success && result.data) {
        setCustomers(result.data);
        setError(null);
        return;
      }

      setError(result.error || result.message);
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, [businessId, customerService, search, token]);

  return (
    <section>
      <h2>POS Customers (Modern)</h2>

      <label>
        Search customers
        <input value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>

      {error ? <p role="alert">{error}</p> : null}

      <ul>
        {customers.map((customer) => (
          <li key={customer.id || `${customer.businessId}-${customer.name}`}>
            {customer.name} {customer.phoneNumber ? `(${customer.phoneNumber})` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
};
