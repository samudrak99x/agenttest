using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

        Console.WriteLine("Original List:");
        numbers.ForEach(Console.WriteLine);

        Console.WriteLine("Doubled List:");
        List<int> doubledNumbers = numbers.Select(num => num * 2).ToList();
        doubledNumbers.ForEach(Console.WriteLine);
    }
}