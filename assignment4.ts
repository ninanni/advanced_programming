// Task 1 and 2 - Types Distance and Time (extended as asked in Task 2) and type Value with unit
type Distance = "meters" | "kilometers" | "yards" | "feet";
type Time = "seconds" | "hours" | "minutes";

type Value<U> = {
    value: number;
    unit: U;
}

// Task 3 - First try adding two values (function copied from exercise sheet)
function add<U>(q0: Value<U>, q1: Value<U>): Value<U> {
    return { value: q0.value + q1.value, unit: q0.unit };
}
// When this add function is given the following two parameters a and b,
// it type-checks and adds minutes to kilometers - which we (morally) don't want.
// Because of the simple U in the function definition, we get type Distance | Time, 
// allowing us this morally incorrect operation (among others).
const a: Value<Distance> = { value: 1, unit: "kilometers" };
const b: Value<Time> = { value: 2, unit: "minutes" };
console.log(add(a, b));

// Task 4 - Second try adding two values (function copied from exercise sheet)
function add2<U1, U2 extends U1>(q0: Value<U1>, q1: Value<U2>): Value<U1> {
    return { value: q0.value + q1.value, unit: q0.unit };
}
// When this add function is given the following two parameters c and d,
// it type-checks and adds meters to kilometers - which we (morally) don't want.
// Because of the type constraint in the function definition, we get the general type Distance, 
// allowing us this morally incorrect operation (among others).
const c: Value<Distance> = { value: 3, unit: "meters" };
const d: Value<Distance> = { value: 3, unit: "kilometers" };
console.log(add2(c, d));

// Task 5 - type-level function that takes two types and checks them for equality
type EqualType<S, T> = [S] extends [T] ? [T] extends [S] ? S : never : never;

// Task 6 - correct version of the add function that only adds compatible types (didn't manage to implement that correctly)
function add3<U1, U2>(q0: Value<U1 & EqualType<U1, U2>>, q1: Value<U2 & EqualType<U1, U2>>): Value<U1> {
    return { value: q0.value + q1.value, unit: q0.unit };
}
// This should not be allowed but still works...
console.log(add(c, d));

// Task 7 - conversion of Distances and Times (both convert to a "base unit" and then to target unit)
const distanceConversions: Record<Distance, number> = {
    meters: 1,
    kilometers: 1000,
    yards: 0.9144,
    feet: 0.3048,
};
function convertDistance(input: Value<Distance>, convertTo: Distance): Value<Distance> {
    const inMeters = input.value * distanceConversions[input.unit];
    const converted = inMeters / distanceConversions[convertTo];
    return { value: converted, unit: convertTo };
}

const timeConversions: Record<Time, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
};
function convertTime(input: Value<Time>, convertTo: Time): Value<Time> {
    const inSeconds = input.value * timeConversions[input.unit];
    const converted = inSeconds / timeConversions[convertTo];
    return { value: converted, unit: convertTo };
}

// Demonstration of converting units:
const tenMeters: Value<Distance> = { value: 10, unit: "meters" };
const twentyYards: Value<Distance> = { value: 20, unit: "yards" };

// I convert to feet so that I can add them and report the result in feet as aked by the exercise (hope I understand this correctly)
const metersInFeet = convertDistance(tenMeters, "feet");
const yardsInFeet = convertDistance(twentyYards, "feet");

// I sum the two values in feet
const sumInFeet = add(metersInFeet, yardsInFeet); //would have been cool to use correct add here
console.log(sumInFeet);

// Task 8 - Define a Prod type that represents the product between two units (allowing distances because multiplying times doesn't make sense)
type Prod<U1 extends Distance, U2 extends Distance> = `${U1}*${U2}`;

// Task 9 - Implement multiplicaton function
function mult<U1 extends Distance, U2 extends Distance>(q0: Value<U1>, q1: Value<U2>): Value<Prod<U1, U2>> {
    return { value: q0.value, unit: `${q0.unit}*${q1.unit}` as Prod<U1, U2> };
}

// Task 10 - Metric has to be all metric units from Distance, but only the ones that are allowed to be used (as stated in the exercise)
type AllowedMetrics = "millimeters" | "centimeters" | "meters" | "kilometers"
type Metric = AllowedMetrics & Distance;