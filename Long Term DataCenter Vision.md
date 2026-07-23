- LA
	- Stack Equipment
		- Refresh Completion
		- 6/8
			- 8 hosts (3 nsh, 5 la)
			- 5 - 6
				- testing proxmox is entirely on the 6 years
			- 2 - 2
				- vmware
			- 1 - 2
				- Embrace Bare Metal
			- Veeam Hosts?
		- M20 Original Pure Array Backup Exec
			- Goes To Tape from disk
		- X50 Pure Array
			- All Flash
			- On it's way out
			- Production VMs
		- C50 (renewing)
			- Databases
			- Faster Read Write (1ms response)
		- C20
			- File Share and DC's (5ms response)
	- Functions
		- Embrace
			- Virtual
			- Bare Metal
		- Primary Cloud Workloads
		- Backups
			- Replica of Nashville backups
				- this is for production in Nashville
			- Local Backups
- Nashville
	- Stack Equipment
		- 3 node cluster (we would need to buy)
			- host to reprovision to embrace bare metal
		- C20
		- Seagate
			- backup respository
				- 700-800 TB needed
		- old stuff from BMH
			- nimble
			- 6 hosts - 10 
			- switches - 6
			- firewall
	- Functions
		- Embrace
		- Backups
			- Offsite Copies in the wild
			- Local Backups
- Atlanta -> 3000
	- Stack Equipment
		- 3 node cluster
		- pure c20 (reprovisioned to ORC to account for aged M50)
		- what we have
			- firewall
			- switches
				- core for node backplane
				- fiber channel storage
				- access level standard communication
- Crexendo -> $7k
- ![[Pasted image 20260520213453.png]]
- Hosts
	- CW PO# 204398
		- ESX11 - PO1
		- ESX12 - PO2
		- ESX13 - PO2
	- Would need to move to 32GB if Keeping. Want to Get rid of.
		- ESX14 - ?
		- ESX15 - ?
	- Need to keep these for long term N+1 with 16GB->32GB for storage
		- ESX16 - Already Had 
			- DELL EMULEX LPe35002 DUAL POR 32GB FC 2 745.00
		- ESX17 - Alerady Had
			-  DELL EMULEX LPe35002 DUAL POR 32GB FC 2 745.00

## Storage for Backups

1.9PB
1856.9+930.5+77.2+81.3=2945.9PB
1856.9-(930.5+77.2+81.3)=767.9TB
1856.9-930.5=926.4TB
930.5-(77.2+81.3)=772TB
1856.9 - Everything in ORC
1028.8 - ORC/nix Embrace, VSA, Mauser non-prod