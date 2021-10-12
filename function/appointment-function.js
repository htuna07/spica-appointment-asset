export * as Bucket from "@spica-devkit/bucket";

const APIKEY = "";
const EMPLOYEE_BUCKET = "";
const APPOINTMENT_BUCKET = "";
const PUBLIC_HOLIDAY_BUCKET = "";


Bucket.initialize({ apikey: APIKEY });

export async function onRatingUpdate(change) {
    const ratingId = change.current._id
    const appointmentId = change.current.appointment

    const updates = []
    // set appointment rating
    let appointment = await Bucket.data.get(APPOINTMENT_BUCKET, appointmentId)
    appointment.rating = ratingId

    updates.push(Bucket.data.patch(APPOINTMENT_BUCKET, appointmentId, { rating: ratingId }))

    // update employee average rating
    const employeeId = appointment.employee
    let employee = await Bucket.data.get(EMPLOYEE_BUCKET, employeeId, { queryParams: { relation: "appointment.rating" } })
    employee.appointments = employee.appointments || [];
    employee.average_rating = (employee.appointments.filter(a => typeof a.rating == "number").reduce((curr, acc) => curr + acc, 0) / employee.appointments.length)

    updates.push(Bucket.data.update(EMPLOYEE_BUCKET, employeeId, employee));

    return Promise.all(updates)
}
