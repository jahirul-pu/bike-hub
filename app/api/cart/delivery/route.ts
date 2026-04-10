import { auth } from "@/auth";
import { getGarageProfileByEmail } from "@/lib/auth/demo-store";
import { SHIPPING_RATES_2026 } from "@/lib/checkout";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json({
      isLoggedIn: false,
      hasAddress: false,
      message: "Login to see delivery charge.",
    });
  }

  const garage = getGarageProfileByEmail(session.user.email);
  const deliveryAddress = garage.deliveryAddress;

  if (!deliveryAddress) {
    return Response.json({
      isLoggedIn: true,
      hasAddress: false,
      message: "Add an address to see delivery charge.",
    });
  }

  const shippingZone = deliveryAddress.zone;
  const deliveryChargeBdt = SHIPPING_RATES_2026[shippingZone];

  return Response.json({
    isLoggedIn: true,
    hasAddress: true,
    shippingZone,
    deliveryChargeBdt,
    addressSummary: `${deliveryAddress.area}, ${deliveryAddress.city}`,
  });
}
