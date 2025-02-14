using System;
using System.Collections.Generic;
using System.Linq;

class Program
{
    static void Main()
    {
        var numbers = new List<int> { 1, 2, 3, 4, 5 };

        Console.WriteLine("Original List:");
        numbers.ForEach(Console.WriteLine);

        Console.WriteLine("Doubled List:");
        var doubledNumbers = numbers.Select(num => num * 2);
        foreach (var num in doubledNumbers)
        {
            Console.WriteLine(num);
        }
    }
}