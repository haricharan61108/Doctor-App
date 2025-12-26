import prisma from "../src/lib/prisma";

async function createTestPrescription() {
  try {
    // Get first patient
    const patient = await prisma.patient.findFirst();
    if (!patient) {
      console.log("❌ No patients found. Please create a patient first.");
      return;
    }

    // Get first doctor
    const doctor = await prisma.doctor.findFirst();
    if (!doctor) {
      console.log("❌ No doctors found. Please create a doctor first.");
      return;
    }

    console.log("✅ Found patient:", patient.name);
    console.log("✅ Found doctor:", doctor.name);

    // Create a test prescription with READY_FOR_PICKUP status
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days

    const prescription = await prisma.prescription.create({
      data: {
        patientId: patient.id,
        doctorId: doctor.id,
        content: "Test Prescription:\n\n1. Paracetamol 500mg - Take 1 tablet twice daily for 5 days\n2. Ibuprofen 400mg - Take 1 tablet if needed for pain\n3. Vitamin C 1000mg - Take 1 tablet daily",
        status: "READY_FOR_PICKUP",
        issuedAt: now,
        expiresAt: expiresAt
      },
      include: {
        patient: true,
        doctor: true
      }
    });

    console.log("\n🎉 Test prescription created successfully!");
    console.log("📋 Prescription ID:", prescription.id);
    console.log("👤 Patient:", prescription.patient.name);
    console.log("👨‍⚕️ Doctor:", prescription.doctor.name);
    console.log("📅 Issued At:", prescription.issuedAt);
    console.log("⏰ Expires At:", prescription.expiresAt);
    console.log("✅ Status:", prescription.status);
    console.log("\n✨ Now login as pharmacist and you should see this prescription!");

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPrescription();
