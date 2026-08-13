import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createClinicExpense,
  deleteClinicExpense,
  getClinicExpense,
  getClinicExpenses,
  updateClinicExpense,
} from "./financial.service";

const get = vi.fn();
const post = vi.fn();
const put = vi.fn();
const del = vi.fn();

vi.mock("@/lib/api", () => ({
  default: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
    put: (...args: unknown[]) => put(...args),
    delete: (...args: unknown[]) => del(...args),
  },
}));

describe("financial.service expenses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    get.mockResolvedValue({ data: { data: [], page: 1, pageSize: 10, totalCount: 0, totalPages: 0 } });
    post.mockResolvedValue({ data: { id: 1 } });
    put.mockResolvedValue({ data: { id: 1 } });
    del.mockResolvedValue({});
  });

  it("lists expenses with period and pagination", async () => {
    const params = { startDate: "2026-08-01", endDate: "2026-08-31", page: 2, pageSize: 10 };

    await getClinicExpenses(params);

    expect(get).toHaveBeenCalledWith("/api/financial/expenses", { params });
  });

  it("uses the CRUD endpoints and payload", async () => {
    const payload = { title: "Aluguel", amount: 1200, date: "2026-08-05T00:00:00.000Z", description: "Sala" };

    await createClinicExpense(payload);
    await getClinicExpense(3);
    await updateClinicExpense(3, payload);
    await deleteClinicExpense(3);

    expect(post).toHaveBeenCalledWith("/api/financial/expenses", payload);
    expect(get).toHaveBeenCalledWith("/api/financial/expenses/3");
    expect(put).toHaveBeenCalledWith("/api/financial/expenses/3", payload);
    expect(del).toHaveBeenCalledWith("/api/financial/expenses/3");
  });
});
