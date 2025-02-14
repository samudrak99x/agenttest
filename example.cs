using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        List<int> numbers = new List<int>() { 1, 2, 3, 4, 5 };
        
        Console.WriteLine("Original List:");
        for (int i = 0; i < numbers.Count; i++)
        {
            Console.WriteLine(numbers[i]);
        }

        Console.WriteLine("Doubled List:");
        List<int> doubledNumbers = new List<int>();
        for (int i = 0; i < numbers.Count; i++)
        {
            doubledNumbers.Add(numbers[i] * 2);
        }

        foreach (int num in doubledNumbers)
        {
            Console.WriteLine(num);
        }
    }
}
