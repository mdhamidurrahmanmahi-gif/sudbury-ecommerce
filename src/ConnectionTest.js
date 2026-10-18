import { useEffect } from "react";
import { supabase } from "./supabase";

function ConnectionTest() {
  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .limit(1);

      if (error) {
        console.error("❌ Supabase Connection Error:", error);
      } else {
        console.log("✅ Supabase Connection Successful!");
        console.log("Products Data:", data);
      }
    }

    testConnection();
  }, []);

  return null;
}

export default ConnectionTest;